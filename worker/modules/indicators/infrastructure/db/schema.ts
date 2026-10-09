import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const geographies = sqliteTable("geographies", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  ineCode: text("ine_code"),
});

export const indicators = sqliteTable("indicators", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  frequency: text("frequency").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  seriesCode: text("series_code").notNull(),
  chartEligible: integer("chart_eligible", { mode: "boolean" }).notNull().default(true),
});

export const observations = sqliteTable(
  "observations",
  {
    id: text("id").primaryKey(),
    indicatorId: text("indicator_id")
      .notNull()
      .references(() => indicators.id),
    geographyId: text("geography_id")
      .notNull()
      .references(() => geographies.id),
    date: text("date").notNull(),
    value: real("value").notNull(),
    dataType: text("data_type"),
    retrievedAt: text("retrieved_at").notNull(),
  },
  (table) => ({
    uniq: uniqueIndex("observations_indicator_geo_date_uq").on(
      table.indicatorId,
      table.geographyId,
      table.date,
    ),
  }),
);

export type GeographyRow = typeof geographies.$inferSelect;
export type IndicatorRow = typeof indicators.$inferSelect;
export type ObservationRow = typeof observations.$inferSelect;
