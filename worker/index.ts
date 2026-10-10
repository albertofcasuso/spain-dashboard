import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { drizzle } from "drizzle-orm/d1";
import type { Env } from "./env";
import { refreshIndicators } from "./modules/indicators/application/refreshIndicators";
import * as schema from "./modules/indicators/infrastructure/db/schema";
import { D1IndicatorRepository } from "./modules/indicators/infrastructure/repositories/d1IndicatorRepository";
import { appRouter } from "./router";

function createRepo(env: Env) {
  const db = drizzle(env.DB, { schema });
  return new D1IndicatorRepository(db);
}

async function handleTrpc(request: Request, env: Env): Promise<Response> {
  const repo = createRepo(env);
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => ({
      db: env.DB,
      indicatorsRepo: repo,
    }),
  });
}

async function handleFetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/health") {
    return Response.json({ status: "ok" });
  }

  // Manual refresh helper for local/ops; Cron uses scheduled(). Prefer tRPC indicators.refresh from the app.
  if (url.pathname === "/api/ingest" && request.method === "POST") {
    const result = await refreshIndicators(createRepo(env));
    return Response.json(result, { status: result.ok ? 200 : 207 });
  }

  if (url.pathname === "/api/trpc" || url.pathname.startsWith("/api/trpc/")) {
    return handleTrpc(request, env);
  }

  if (env.ASSETS) {
    return env.ASSETS.fetch(request);
  }

  return new Response("España en Datos", { status: 200 });
}

async function runScheduled(env: Env): Promise<void> {
  await refreshIndicators(createRepo(env));
}

const worker = {
  fetch: handleFetch,
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    await runScheduled(env);
  },
};

export default worker;
