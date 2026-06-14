import assert from "node:assert/strict";
import test from "node:test";
import { createNotificationProvider } from "./index.ts";

test("uses mock email and WhatsApp providers", async () => {
  const email = await createNotificationProvider(
    "email",
    "mock"
  ).healthcheck();
  const whatsapp = await createNotificationProvider(
    "whatsapp",
    "mock"
  ).healthcheck();

  assert.equal(email.ok, true);
  assert.equal(whatsapp.ok, true);
});
