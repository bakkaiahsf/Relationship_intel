export type PaymentHealth = {
  latencyMs: number;
  message?: string;
  ok: boolean;
  provider: string;
};

export interface PaymentProvider {
  healthcheck(): Promise<PaymentHealth>;
}

export class MockPaymentProvider implements PaymentProvider {
  async healthcheck(): Promise<PaymentHealth> {
    return {
      latencyMs: 0,
      message: "Mock payment provider is active.",
      ok: true,
      provider: "mock"
    };
  }
}

export function createPaymentProvider(provider: string): PaymentProvider {
  if (provider === "mock") {
    return new MockPaymentProvider();
  }

  return {
    async healthcheck() {
      return {
        latencyMs: 0,
        message: `Payment provider "${provider}" is selected but not implemented.`,
        ok: false,
        provider
      };
    }
  };
}
