import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const client = new BedrockRuntimeClient({
  region: getRequiredEnv("AWS_REGION"),
  credentials: {
    accessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

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

  const command = new InvokeModelCommand({
    modelId: getRequiredEnv("BEDROCK_MODEL_ID"),
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await client.send(command);
  const parsed = JSON.parse(new TextDecoder().decode(response.body));
  return parsed.content[0].text as string;
}
