export type AiMessage = {
  content: string;
  role: "assistant" | "system" | "user";
};

export type AiRequest = {
  messages: AiMessage[];
  model?: string;
};

export type AiHealth = {
  latencyMs: number;
  message?: string;
  model?: string;
  ok: boolean;
  provider: string;
};

export interface AiProvider {
  generate(request: AiRequest): Promise<{ text: string }>;
  healthcheck(): Promise<AiHealth>;
}

export class UnconfiguredAiProvider implements AiProvider {
  async generate(): Promise<never> {
    throw new Error(
      "AI is not configured. Add a provider adapter and server-side credentials."
    );
  }

  async healthcheck(): Promise<AiHealth> {
    return {
      latencyMs: 0,
      message: "AI provider credentials are not configured.",
      ok: false,
      provider: "unconfigured"
    };
  }
}

type Fetch = typeof fetch;

type OpenAiResponse = {
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
    type?: string;
  }>;
};

export class OpenAiProvider implements AiProvider {
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly fetcher: Fetch;

  constructor(
    apiKey: string,
    defaultModel: string,
    fetcher: Fetch = fetch
  ) {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    this.fetcher = fetcher;
  }

  async generate(request: AiRequest): Promise<{ text: string }> {
    const response = await this.fetcher("https://api.openai.com/v1/responses", {
      body: JSON.stringify({
        input: request.messages,
        model: request.model ?? this.defaultModel,
        store: false
      }),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`OpenAI returned HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as OpenAiResponse;
    const text = payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === "output_text")?.text;

    if (!text) {
      throw new Error("OpenAI response did not contain output text.");
    }

    return { text };
  }

  async healthcheck(): Promise<AiHealth> {
    const startedAt = performance.now();

    try {
      const response = await this.fetcher(
        `https://api.openai.com/v1/models/${encodeURIComponent(this.defaultModel)}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          },
          method: "GET",
          signal: AbortSignal.timeout(5000)
        }
      );

      return {
        latencyMs: Math.round(performance.now() - startedAt),
        message: response.ok
          ? undefined
          : `OpenAI returned HTTP ${response.status}.`,
        model: this.defaultModel,
        ok: response.ok,
        provider: "openai"
      };
    } catch (error) {
      return {
        latencyMs: Math.round(performance.now() - startedAt),
        message: error instanceof Error ? error.message : "OpenAI request failed.",
        model: this.defaultModel,
        ok: false,
        provider: "openai"
      };
    }
  }
}

export function createAiProvider(config: {
  apiKey?: string;
  model: string;
  provider: string;
}): AiProvider {
  if (config.provider !== "openai" || !config.apiKey) {
    return new UnconfiguredAiProvider();
  }

  return new OpenAiProvider(config.apiKey, config.model);
}
