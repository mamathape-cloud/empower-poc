import { NextRequest, NextResponse } from "next/server";
import { callBedrock } from "@/lib/bedrock";
import {
  IntakeData,
  EMPOWER_SYSTEM,
  buildEmpowerPrompt,
  buildNaivePrompt,
  CLAUDE_TRAINING_DESCRIPTION,
} from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const data: IntakeData = await req.json();

    const required = [
      "goal",
      "role",
      "funnelStage",
      "stack",
      "timeframe",
    ] as const;
    for (const field of required) {
      if (!data[field]?.trim()) {
        return NextResponse.json(
          { error: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }

    const [empowerRaw, naiveRaw] = await Promise.all([
      callBedrock(buildEmpowerPrompt(data), EMPOWER_SYSTEM),
      callBedrock(buildNaivePrompt(data)),
    ]);

    let empowerPlan: Record<string, unknown> = {};
    try {
      const cleaned = empowerRaw.replace(/```json|```/g, "").trim();
      empowerPlan = JSON.parse(cleaned);
    } catch {
      empowerPlan = { headline: empowerRaw };
    }

    return NextResponse.json({
      empower: empowerPlan,
      claudeAlone: naiveRaw,
      claudeTraining: CLAUDE_TRAINING_DESCRIPTION,
      intake: data,
    });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
