export type NotificationChannel = "email" | "whatsapp";

export type NotificationHealth = {
  channel: NotificationChannel;
  latencyMs: number;
  message?: string;
  ok: boolean;
  provider: string;
};

export interface NotificationProvider {
  healthcheck(): Promise<NotificationHealth>;
}

export class MockNotificationProvider implements NotificationProvider {
  private readonly channel: NotificationChannel;

  constructor(channel: NotificationChannel) {
    this.channel = channel;
  }

  async healthcheck(): Promise<NotificationHealth> {
    return {
      channel: this.channel,
      latencyMs: 0,
      message: `Mock ${this.channel} provider is active.`,
      ok: true,
      provider: "mock"
    };
  }
}

export function createNotificationProvider(
  channel: NotificationChannel,
  provider: string
): NotificationProvider {
  if (provider === "mock") {
    return new MockNotificationProvider(channel);
  }

  return {
    async healthcheck() {
      return {
        channel,
        latencyMs: 0,
        message: `${channel} provider "${provider}" is selected but not implemented.`,
        ok: false,
        provider
      };
    }
  };
}
