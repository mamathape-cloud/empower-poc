import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  BedrockClient,
  ListFoundationModelsCommand,
} from "@aws-sdk/client-bedrock";

const PREFERRED_MODELS = [
  "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "anthropic.claude-3-sonnet-20240229-v1:0",
  "anthropic.claude-3-haiku-20240307-v1:0",
] as const;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getAwsConfig() {
  return {
    region: getRequiredEnv("AWS_REGION"),
    credentials: {
      accessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  };
}

let runtimeClient: BedrockRuntimeClient | null = null;

function getRuntimeClient(): BedrockRuntimeClient {
  if (!runtimeClient) {
    runtimeClient = new BedrockRuntimeClient(getAwsConfig());
  }
  return runtimeClient;
}

/**
 * ListFoundationModels is a control-plane API on {@link BedrockClient}.
 * We take {@link BedrockRuntimeClient} so callers pair selection with the same
 * region/credentials as invoke, then mirror config onto a short-lived list client.
 */
async function getBestAvailableModel(
  client: BedrockRuntimeClient
): Promise<string> {
  const envModelId = process.env.BEDROCK_MODEL_ID?.trim();
  if (envModelId) {
    console.log(`Using model from environment variable: ${envModelId}`);
    return envModelId;
  }

  const { region, credentials } = client.config;
  const listClient = new BedrockClient({ region, credentials });

  try {
    const response = await listClient.send(new ListFoundationModelsCommand({}));
    const summaries = response.modelSummaries ?? [];

    const preferredSet = new Set<string>(PREFERRED_MODELS);
    const availablePreferred = new Set(
      summaries
        .filter((m) => {
          const id = m.modelId?.trim();
          if (!id || !preferredSet.has(id)) return false;
          const types = m.inferenceTypesSupported ?? [];
          return types.includes("ON_DEMAND");
        })
        .map((m) => m.modelId!.trim())
    );

    for (const id of PREFERRED_MODELS) {
      if (availablePreferred.has(id)) {
        console.log("[bedrock] selected model:", id);
        return id;
      }
    }
  } catch (err) {
    console.warn(
      "[bedrock] ListFoundationModels failed, using first preferred model:",
      err
    );
  }

  const fallback = PREFERRED_MODELS[0];
  console.log("[bedrock] selected model (fallback):", fallback);
  return fallback;
}

export async function callBedrock(
  userPrompt: string,
  systemPrompt?: string
): Promise<string> {
  const runtime = getRuntimeClient();
  const modelId = await getBestAvailableModel(runtime);

  const body: Record<string, unknown> = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1500,
    messages: [{ role: "user", content: userPrompt }],
  };
  if (systemPrompt) body.system = systemPrompt;

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await runtime.send(command);
  const parsed = JSON.parse(new TextDecoder().decode(response.body));
  return parsed.content[0].text as string;
}
