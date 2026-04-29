import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  BedrockClient,
  ListFoundationModelsCommand,
} from "@aws-sdk/client-bedrock";

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
let controlPlaneClient: BedrockClient | null = null;

function getRuntimeClient(): BedrockRuntimeClient {
  if (!runtimeClient) {
    runtimeClient = new BedrockRuntimeClient(getAwsConfig());
  }
  return runtimeClient;
}

function getControlPlaneClient(): BedrockClient {
  if (!controlPlaneClient) {
    controlPlaneClient = new BedrockClient(getAwsConfig());
  }
  return controlPlaneClient;
}

let resolvedModelIdPromise: Promise<string> | null = null;

function modelRank(modelId: string): number {
  const dateMatch = modelId.match(/(20\d{2})(\d{2})(\d{2})/);
  if (dateMatch) {
    const [, y, m, d] = dateMatch;
    return Number(`${y}${m}${d}`);
  }

  // Fallback when no date exists in model id.
  const versionMatch = modelId.match(/v(\d+):(\d+)/i);
  if (versionMatch) {
    const [, major, minor] = versionMatch;
    return Number(major) * 100 + Number(minor);
  }

  return 0;
}

async function resolveModelId(): Promise<string> {
  if (process.env.BEDROCK_MODEL_ID?.trim()) {
    return process.env.BEDROCK_MODEL_ID.trim();
  }

  if (!resolvedModelIdPromise) {
    resolvedModelIdPromise = (async () => {
      const response = await getControlPlaneClient().send(
        // Resolve latest model once per server process.
        new ListFoundationModelsCommand({
          byProvider: "Anthropic",
          byOutputModality: "TEXT",
        })
      );

      const candidates = (response.modelSummaries ?? [])
        .map((model) => model.modelId?.trim() ?? "")
        .filter((modelId): modelId is string => modelId.length > 0)
        .sort((a, b) => modelRank(b) - modelRank(a));

      const latest = candidates[0];
      if (!latest) {
        throw new Error(
          "Could not resolve a Bedrock model. Set BEDROCK_MODEL_ID explicitly."
        );
      }

      return latest;
    })();
  }

  return resolvedModelIdPromise;
}

export async function callBedrock(
  userPrompt: string,
  systemPrompt?: string
): Promise<string> {
  const body: Record<string, unknown> = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1500,
    messages: [{ role: "user", content: userPrompt }],
  };
  if (systemPrompt) body.system = systemPrompt;
  const modelId = await resolveModelId();
  if (!modelId.trim()) {
    throw new Error(
      "Resolved Bedrock model id was empty. Set BEDROCK_MODEL_ID explicitly."
    );
  }

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await getRuntimeClient().send(command);
  const parsed = JSON.parse(new TextDecoder().decode(response.body));
  return parsed.content[0].text as string;
}
