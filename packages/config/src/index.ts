export type PublicAppConfig = {
  appName: string;
  appUrl: string;
};

export function getPublicAppConfig(
  env: Record<string, string | undefined>
): PublicAppConfig {
  return {
    appName: env.NEXT_PUBLIC_APP_NAME ?? "AI SaaS App",
    appUrl: env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
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
