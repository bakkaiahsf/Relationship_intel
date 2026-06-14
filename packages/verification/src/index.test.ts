import assert from "node:assert/strict";
import test from "node:test";
import { createVerificationProvider } from "./index.ts";

test("uses the mock KYB provider", async () => {
  const health = await createVerificationProvider("mock").healthcheck();

  assert.equal(health.ok, true);
  assert.equal(health.provider, "mock");
});
