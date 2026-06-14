import { createAiProvider } from "@accelerator/ai";
import { getServerConnectorConfig } from "@accelerator/config";
import { createDatabaseAdapter } from "@accelerator/db";
import { createNotificationProvider } from "@accelerator/notifications";
import { createPaymentProvider } from "@accelerator/payments";
import { createVerificationProvider } from "@accelerator/verification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = getServerConnectorConfig(process.env);

  if (!config.jobAuthToken) {
    return Response.json(
      {
        error: {
          code: "HEALTH_AUTH_NOT_CONFIGURED",
          message: "Connectivity health authentication is not configured."
        },
        service: "rivr",
        status: "degraded"
      },
      { status: 503 }
    );
  }

  if (
    request.headers.get("authorization") !==
    `Bearer ${config.jobAuthToken}`
  ) {
    return Response.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "A valid bearer token is required."
        }
      },
      { status: 401 }
    );
  }

  const database = createDatabaseAdapter(config.database);
  const ai = createAiProvider(config.ai);
  const kyb = createVerificationProvider(config.providers.kyb);
  const email = createNotificationProvider(
    "email",
    config.providers.email
  );
  const whatsapp = createNotificationProvider(
    "whatsapp",
    config.providers.whatsapp
  );
  const payments = createPaymentProvider(config.providers.payments);

  const [
    databaseHealth,
    aiHealth,
    kybHealth,
    emailHealth,
    whatsappHealth,
    paymentHealth
  ] = await Promise.all([
    database.healthcheck(),
    ai.healthcheck(),
    kyb.healthcheck(),
    email.healthcheck(),
    whatsapp.healthcheck(),
    payments.healthcheck()
  ]);

  const connectors = {
    ai: aiHealth,
    database: databaseHealth,
    email: emailHealth,
    kyb: kybHealth,
    payments: paymentHealth,
    whatsapp: whatsappHealth
  };
  const requiredConnectorsHealthy =
    databaseHealth.ok && databaseHealth.schemaReady !== false && aiHealth.ok;

  return Response.json(
    {
      connectors,
      service: "rivr",
      status: requiredConnectorsHealthy ? "ok" : "degraded"
    },
    {
      headers: {
        "Cache-Control": "no-store"
      },
      status: requiredConnectorsHealthy ? 200 : 503
    }
  );
}
