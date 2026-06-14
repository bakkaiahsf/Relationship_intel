export type ConnectorHealth = {
  latencyMs: number;
  message?: string;
  ok: boolean;
  provider: string;
  schemaReady?: boolean;
};

export interface DatabaseAdapter {
  healthcheck(): Promise<ConnectorHealth>;
}

export class UnconfiguredDatabaseAdapter implements DatabaseAdapter {
  async healthcheck() {
    return {
      latencyMs: 0,
      message: "Supabase server credentials are not configured.",
      ok: false,
      provider: "unconfigured"
    };
  }
}

type Fetch = typeof fetch;

export class SupabaseDatabaseAdapter implements DatabaseAdapter {
  private readonly fetcher: Fetch;
  private readonly serviceRoleKey: string;
  private readonly url: string;

  constructor(
    url: string,
    serviceRoleKey: string,
    fetcher: Fetch = fetch
  ) {
    this.url = url;
    this.serviceRoleKey = serviceRoleKey;
    this.fetcher = fetcher;
  }

  async healthcheck(): Promise<ConnectorHealth> {
    const startedAt = performance.now();
    const baseUrl = this.url.replace(/\/$/, "");
    const headers = {
      Accept: "application/json",
      apikey: this.serviceRoleKey,
      Authorization: `Bearer ${this.serviceRoleKey}`
    };

    try {
      const response = await this.fetcher(`${baseUrl}/rest/v1/`, {
        headers,
        method: "GET",
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return {
          latencyMs: Math.round(performance.now() - startedAt),
          message: `Supabase returned HTTP ${response.status}.`,
          ok: false,
          provider: "supabase"
        };
      }

      const schemaResponse = await this.fetcher(
        `${baseUrl}/rest/v1/organizations?select=id&limit=1`,
        {
          headers,
          method: "GET",
          signal: AbortSignal.timeout(5000)
        }
      );

      return {
        latencyMs: Math.round(performance.now() - startedAt),
        message: schemaResponse.ok
          ? undefined
          : "Supabase is reachable, but the RIVR schema is not ready.",
        ok: true,
        provider: "supabase",
        schemaReady: schemaResponse.ok
      };
    } catch (error) {
      return {
        latencyMs: Math.round(performance.now() - startedAt),
        message: error instanceof Error ? error.message : "Supabase request failed.",
        ok: false,
        provider: "supabase"
      };
    }
  }
}

export function createDatabaseAdapter(config: {
  serviceRoleKey?: string;
  url?: string;
}): DatabaseAdapter {
  if (!config.url || !config.serviceRoleKey) {
    return new UnconfiguredDatabaseAdapter();
  }

  return new SupabaseDatabaseAdapter(config.url, config.serviceRoleKey);
}
