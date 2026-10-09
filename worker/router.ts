import { router } from "./trpc";
import { indicatorsRouter } from "./modules/indicators/api/indicatorsRouter";

export const appRouter = router({
  indicators: indicatorsRouter,
});

export type AppRouter = typeof appRouter;
