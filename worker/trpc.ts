import { initTRPC } from "@trpc/server";
import type { D1IndicatorRepository } from "./modules/indicators/infrastructure/repositories/d1IndicatorRepository";

export interface AppContext {
  indicatorsRepo: D1IndicatorRepository;
  db: D1Database;
}

const t = initTRPC.context<AppContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
