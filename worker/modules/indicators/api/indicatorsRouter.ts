import { z } from "zod";
import { publicProcedure, router } from "../../../trpc";
import { getIndicatorSeries } from "../application/getIndicatorSeries";
import { listLatestIndicators } from "../application/listLatestIndicators";
import { refreshIndicators } from "../application/refreshIndicators";

export const indicatorsRouter = router({
  listLatest: publicProcedure.query(async ({ ctx }) => {
    return listLatestIndicators(ctx.indicatorsRepo);
  }),

  getSeries: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return getIndicatorSeries(ctx.indicatorsRepo, input.slug);
    }),

  refresh: publicProcedure.mutation(async ({ ctx }) => {
    return refreshIndicators(ctx.indicatorsRepo);
  }),
});
