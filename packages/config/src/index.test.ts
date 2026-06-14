import assert from "node:assert/strict";
import test from "node:test";
import { getServerConnectorConfig } from "./index.ts";

test("uses live core defaults and mock optional providers", () => {
  const config = getServerConnectorConfig({});

  assert.equal(config.ai.model, "gpt-5.4");
  assert.equal(config.ai.provider, "openai");
  assert.equal(config.providers.kyb, "mock");
  assert.equal(config.providers.email, "mock");
  assert.equal(config.providers.whatsapp, "mock");
  assert.equal(config.providers.payments, "mock");
});

test("uses Supabase secret key fallback", () => {
  const config = getServerConnectorConfig({
    SUPABASE_SECRET_KEY: "secret",
    SUPABASE_URL: "https://example.supabase.co"
  });

  assert.equal(config.database.serviceRoleKey, "secret");
  assert.equal(config.database.url, "https://example.supabase.co");
});
