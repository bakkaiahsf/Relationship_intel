export type PublicAppConfig = {
  appName: string;
  appUrl: string;
};

export type ProviderSelection = {
  ai: string;
  email: string;
  kyb: string;
  payments: string;
  whatsapp: string;
};

export type ServerConnectorConfig = {
  ai: {
    apiKey?: string;
    model: string;
    provider: string;
  };
  app: PublicAppConfig;
  database: {
    serviceRoleKey?: string;
    url?: string;
  };
  jobAuthToken?: string;
  providers: ProviderSelection;
  vercel: {
    orgId?: string;
    projectId?: string;
  };
};

export function getPublicAppConfig(
  env: Record<string, string | undefined>
): PublicAppConfig {
  return {
    appName: env.NEXT_PUBLIC_APP_NAME ?? "RIVR",
    appUrl: env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  };
}

function optionalEnv(
  env: Record<string, string | undefined>,
  name: string
): string | undefined {
  const value = env[name]?.trim();
  return value || undefined;
}

export function getServerConnectorConfig(
  env: Record<string, string | undefined>
): ServerConnectorConfig {
  const aiProvider = optionalEnv(env, "AI_PROVIDER") ?? "openai";

  return {
    ai: {
      apiKey:
        aiProvider === "openai"
          ? optionalEnv(env, "OPENAI_API_KEY")
          : undefined,
      model: optionalEnv(env, "AI_MODEL") ?? "gpt-5.4",
      provider: aiProvider
    },
    app: getPublicAppConfig(env),
    database: {
      serviceRoleKey:
        optionalEnv(env, "SUPABASE_SERVICE_ROLE_KEY") ??
        optionalEnv(env, "SUPABASE_SECRET_KEY"),
      url:
        optionalEnv(env, "SUPABASE_URL") ??
        optionalEnv(env, "NEXT_PUBLIC_SUPABASE_URL")
    },
    jobAuthToken: optionalEnv(env, "JOB_AUTH_TOKEN"),
    providers: {
      ai: aiProvider,
      email: optionalEnv(env, "NOTIFICATION_EMAIL_PROVIDER") ?? "mock",
      kyb: optionalEnv(env, "KYB_PROVIDER") ?? "mock",
      payments: optionalEnv(env, "PAYMENTS_PROVIDER") ?? "mock",
      whatsapp:
        optionalEnv(env, "NOTIFICATION_WHATSAPP_PROVIDER") ?? "mock"
    },
    vercel: {
      orgId: optionalEnv(env, "VERCEL_ORG_ID"),
      projectId: optionalEnv(env, "VERCEL_PROJECT_ID")
    }
  };
}

export function requireServerEnv(
  env: Record<string, string | undefined>,
  name: string
): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}
