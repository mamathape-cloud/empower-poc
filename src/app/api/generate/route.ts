import { NextRequest, NextResponse } from "next/server";
import { callBedrock } from "@/lib/bedrock";
import {
  IntakeData,
  EMPOWER_SYSTEM,
  buildEmpowerPrompt,
  buildNaivePrompt,
  CLAUDE_TRAINING_DESCRIPTION,
} from "@/lib/prompts";

interface ModuleRecommendation {
  module: string;
  title: string;
  chapters: Array<{
    chapter: string;
    topic: string;
    link: string;
  }>;
}

function buildLearningRecommendations(): ModuleRecommendation[] {
  return [
    {
      module: "Module 1",
      title: "AI Foundations (Human-First)",
      chapters: [
        {
          chapter: "Chapter 1",
          topic: "What AI Actually Is & LLMs Explained",
          link: "#module1-chapter1",
        },
        {
          chapter: "Chapter 2",
          topic: "RAG, Vector Databases & How AI Systems Work",
          link: "#module1-chapter2",
        },
        {
          chapter: "Chapter 3",
          topic:
            "AI vs ML vs Tools — Model Comparison & When to Use Which",
          link: "#module1-chapter3",
        },
        {
          chapter: "Chapter 4",
          topic: "AI Limitations, Responsible Use & Human-First Mindset",
          link: "#module1-chapter4",
        },
      ],
    },
    {
      module: "Module 2",
      title: "Prompting for Work",
      chapters: [
        {
          chapter: "Chapter 1",
          topic:
            "The Prompt Framework — Role, Context, Task, Constraints, Format",
          link: "#module2-chapter1",
        },
        {
          chapter: "Chapter 2",
          topic: "SCQA as a Clarity Tool — Before & After Examples",
          link: "#module2-chapter2",
        },
        {
          chapter: "Chapter 3",
          topic: "Prompt Debugging & the Prompt-to-Workflow Pipeline",
          link: "#module2-chapter3",
        },
        {
          chapter: "Chapter 4",
          topic: "Prompting for Personal Productivity & Strategic Planning",
          link: "#module2-chapter4",
        },
      ],
    },
    {
      module: "Module 3",
      title: "Use Cases by Function",
      chapters: [
        {
          chapter: "Chapter 1",
          topic: "HR Use Cases — Job Descriptions, Policies, Onboarding",
          link: "#module3-chapter1",
        },
        {
          chapter: "Chapter 2",
          topic: "Finance Use Cases — Reports, Variance Analysis, Narratives",
          link: "#module3-chapter2",
        },
        {
          chapter: "Chapter 3",
          topic:
            "Sales & Marketing — Outreach, Campaigns, Document Analysis",
          link: "#module3-chapter3",
        },
        {
          chapter: "Chapter 4",
          topic: "Automation Workflows — Calendar, Tasks, AI Thought Partner",
          link: "#module3-chapter4",
        },
      ],
    },
  ];
}

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
      learningRecommendations: buildLearningRecommendations(),
      intake: data,
    });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
