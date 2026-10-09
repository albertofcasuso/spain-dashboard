import type { D1IndicatorRepository } from "../infrastructure/repositories/d1IndicatorRepository";
import type { LatestIndicatorView } from "../domain/types";

export async function listLatestIndicators(
  repo: D1IndicatorRepository,
): Promise<{ indicators: LatestIndicatorView[] }> {
  const indicators = await repo.listLatestIndicators();
  return { indicators };
}
