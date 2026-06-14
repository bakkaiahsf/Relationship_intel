export type ProviderHealth = {
  latencyMs: number;
  message?: string;
  ok: boolean;
  provider: string;
};

export interface VerificationProvider {
  healthcheck(): Promise<ProviderHealth>;
}

export class MockVerificationProvider implements VerificationProvider {
  async healthcheck(): Promise<ProviderHealth> {
    return {
      latencyMs: 0,
      message: "Mock KYB provider is active.",
      ok: true,
      provider: "mock"
    };
  }
}

export function createVerificationProvider(
  provider: string
): VerificationProvider {
  if (provider === "mock") {
    return new MockVerificationProvider();
  }

  return {
    async healthcheck() {
      return {
        latencyMs: 0,
        message: `KYB provider "${provider}" is selected but not implemented.`,
        ok: false,
        provider
      };
    }
  };
}
