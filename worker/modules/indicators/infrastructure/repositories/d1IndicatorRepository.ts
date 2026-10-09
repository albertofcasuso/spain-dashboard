import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Indicator, LatestIndicatorView, Observation } from "../../domain/types";
import { formatPeriodLabel } from "../../domain/period";
import { absoluteVariation, variationLabel } from "../../domain/variation";
import * as schema from "../db/schema";

type Db = DrizzleD1Database<typeof schema>;

const GEO_ES = "geo-es";

function observationId(indicatorId: string, date: string): string {
  return `obs:${indicatorId}:${date}`;
}

export class D1IndicatorRepository {
  constructor(private readonly db: Db) {}

  async listIndicators(): Promise<Indicator[]> {
    const rows = await this.db.select().from(schema.indicators);
    return rows.map(mapIndicator);
  }

  async getIndicatorBySlug(slug: string): Promise<Indicator | null> {
    const rows = await this.db
      .select()
      .from(schema.indicators)
      .where(eq(schema.indicators.slug, slug))
      .limit(1);
    return rows[0] ? mapIndicator(rows[0]) : null;
  }

  async upsertObservations(
    indicatorId: string,
    geographyId: string,
    observations: Array<{ date: string; value: number; dataType: string | null }>,
    retrievedAt: string,
  ): Promise<number> {
    if (observations.length === 0) return 0;

    let written = 0;
    // D1 allows ≤100 bound parameters per statement; 7 cols ⇒ max 14 rows.
    const chunkSize = 12;
    for (let i = 0; i < observations.length; i += chunkSize) {
      const chunk = observations.slice(i, i + chunkSize);
      await this.db
        .insert(schema.observations)
        .values(
          chunk.map((o) => ({
            id: observationId(indicatorId, o.date),
            indicatorId,
            geographyId,
            date: o.date,
            value: o.value,
            dataType: o.dataType,
            retrievedAt,
          })),
        )
        .onConflictDoUpdate({
          target: [
            schema.observations.indicatorId,
            schema.observations.geographyId,
            schema.observations.date,
          ],
          set: {
            value: sql`excluded.value`,
            dataType: sql`excluded.data_type`,
            retrievedAt: sql`excluded.retrieved_at`,
          },
        });
      written += chunk.length;
    }
    return written;
  }

  async listObservationsChrono(indicatorId: string, geographyId = GEO_ES): Promise<Observation[]> {
    const rows = await this.db
      .select()
      .from(schema.observations)
      .where(
        and(
          eq(schema.observations.indicatorId, indicatorId),
          eq(schema.observations.geographyId, geographyId),
        ),
      )
      .orderBy(asc(schema.observations.date));
    return rows.map(mapObservation);
  }

  async latestTwo(indicatorId: string, geographyId = GEO_ES): Promise<Observation[]> {
    const rows = await this.db
      .select()
      .from(schema.observations)
      .where(
        and(
          eq(schema.observations.indicatorId, indicatorId),
          eq(schema.observations.geographyId, geographyId),
        ),
      )
      .orderBy(desc(schema.observations.date))
      .limit(2);
    return rows.map(mapObservation);
  }

  async listLatestIndicators(): Promise<LatestIndicatorView[]> {
    const indicators = await this.listIndicators();
    const out: LatestIndicatorView[] = [];

    for (const ind of indicators) {
      const latest = await this.latestTwo(ind.id);
      const current = latest[0] ?? null;
      const previous = latest[1] ?? null;
      const variationAbsolute = absoluteVariation(current?.value, previous?.value);

      out.push({
        slug: ind.slug,
        name: ind.name,
        description: ind.description,
        value: current?.value ?? null,
        unit: ind.unit,
        frequency: ind.frequency,
        observationDate: current?.date ?? null,
        periodLabel: current ? formatPeriodLabel(current.date, ind.frequency) : null,
        dataType: current?.dataType ?? null,
        retrievedAt: current?.retrievedAt ?? null,
        sourceName: ind.sourceName,
        sourceUrl: ind.sourceUrl,
        variationAbsolute,
        variationLabel: variationLabel(variationAbsolute, ind.frequency, ind.unit),
        chartEligible: ind.chartEligible,
        status: current ? "ok" : "empty",
      });
    }

    return out;
  }
}

function mapIndicator(row: schema.IndicatorRow): Indicator {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    unit: row.unit,
    frequency: row.frequency,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    seriesCode: row.seriesCode,
    chartEligible: row.chartEligible,
  };
}

function mapObservation(row: schema.ObservationRow): Observation {
  return {
    id: row.id,
    indicatorId: row.indicatorId,
    geographyId: row.geographyId,
    date: row.date,
    value: row.value,
    dataType: (row.dataType as Observation["dataType"]) ?? null,
    retrievedAt: row.retrievedAt,
  };
}

export { GEO_ES };
