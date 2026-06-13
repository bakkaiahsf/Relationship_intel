export interface DatabaseAdapter {
  healthcheck(): Promise<{ ok: boolean; provider: string }>;
}

export class UnconfiguredDatabaseAdapter implements DatabaseAdapter {
  async healthcheck() {
    return { ok: false, provider: "unconfigured" };
  }
}
