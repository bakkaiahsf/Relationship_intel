import assert from "node:assert/strict";
import test from "node:test";
import { SupabaseDatabaseAdapter } from "./index.ts";

test("distinguishes Supabase connectivity from schema readiness", async () => {
  const responses = [
    new Response("{}", { status: 200 }),
    new Response("{}", { status: 404 })
  ];
  const fetcher = (async () => responses.shift()!) as typeof fetch;
  const adapter = new SupabaseDatabaseAdapter(
    "https://example.supabase.co",
    "secret",
    fetcher
  );

  const health = await adapter.healthcheck();

  assert.equal(health.ok, true);
  assert.equal(health.schemaReady, false);
  assert.match(health.message ?? "", /schema is not ready/);
});
