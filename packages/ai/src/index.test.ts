import assert from "node:assert/strict";
import test from "node:test";
import { OpenAiProvider } from "./index.ts";

test("checks configured OpenAI model access", async () => {
  let requestedUrl = "";
  const fetcher = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response("{}", { status: 200 });
  }) as typeof fetch;
  const provider = new OpenAiProvider("secret", "gpt-5.4", fetcher);

  const health = await provider.healthcheck();

  assert.equal(health.ok, true);
  assert.equal(health.model, "gpt-5.4");
  assert.match(requestedUrl, /\/models\/gpt-5.4$/);
});
