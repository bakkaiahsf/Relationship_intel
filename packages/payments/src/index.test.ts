import assert from "node:assert/strict";
import test from "node:test";
import { createPaymentProvider } from "./index.ts";

test("uses the mock payment provider", async () => {
  const health = await createPaymentProvider("mock").healthcheck();

  assert.equal(health.ok, true);
  assert.equal(health.provider, "mock");
});
