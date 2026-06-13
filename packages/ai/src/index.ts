export type AiMessage = {
  content: string;
  role: "assistant" | "system" | "user";
};

export type AiRequest = {
  messages: AiMessage[];
  model?: string;
};

export interface AiProvider {
  generate(request: AiRequest): Promise<{ text: string }>;
}

export class UnconfiguredAiProvider implements AiProvider {
  async generate(): Promise<never> {
    throw new Error(
      "AI is not configured. Add a provider adapter and server-side credentials."
    );
  }
}
