export interface IntakeData {
  goal: string;
  role: string;
  funnelStage: string;
  stack: string;
  timeframe: string;
}

export interface EmpowerModule {
  module: string;
  title: string;
  chapters: Array<{
    chapter: string;
    topic: string;
    link: string;
  }>;
}

export const EMPOWER_SYSTEM = `You are the Empower AI Pathways planning engine.
You help sales leaders improve their results using AI.
You return ONLY a JSON object — no preamble, no commentary, no markdown fences.
The JSON must match this exact shape:
{
  "headline": "one sentence summary of the plan",
  "why_specific": "one sentence explaining why this plan is specific to this leader",
  "top_tools": [
    { "name": "tool name", "use": "what to use it for" }
  ],
  "top_automations": [
    { "name": "automation name", "trigger": "what triggers it", "outcome": "what it produces" }
  ],
  "week_1_actions": ["action 1", "action 2", "action 3"],
  "expected_outcome": "what the leader should see improved after 12 weeks"
}
Keep all values concise — max 2 sentences per field. Be specific to the leader's role,
stack, ane funnel stage they named.`;

export const MODULE_SELECTOR_SYSTEM = `You are the Empower AI Pathways curriculum advisor.
You return ONLY a JSON array — no preamble, no commentary, no markdown fences.
Each item in the array must match this shape exactly:
{ module: string, title: string, chapters: [{ chapter: string, topic: string, link: string }] }
Only include modules and chapters that are directly relevant to the user's
role, goal, funnel stage, and timeframe. Never return all chapters.
Return between 2 and 6 chapters total across all modules.`;

export const EMPOWER_MODULES: EmpowerModule[] = [
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
        topic: "AI vs ML vs Tools — Model Comparison & When to Use Which",
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
        topic: "Sales & Marketing — Outreach, Campaigns, Document Analysis",
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

export function buildEmpowerPrompt(data: IntakeData): string {
  return [
    `Leader role: ${data.role}`,
    `Goal: ${data.goal}`,
    `Funnel stage that is leaking: ${data.funnelStage}`,
    `Current tech stack: ${data.stack}`,
    `Timeframe: ${data.timeframe}`,
    "",
    "Generate the plan for this leader.",
  ].join("\n");
}

export function buildNaivePrompt(data: IntakeData): string {
  return `I am a ${data.role}. My goal is: ${data.goal}. What should I do?`;
}

export function buildModuleSelectorPrompt(
  data: IntakeData,
  modules: EmpowerModule[]
): string {
  return `Here is the full module library: ${JSON.stringify(modules)}

The user profile is:
Role: ${data.role}
Goal: ${data.goal}
Funnel stage leaking: ${data.funnelStage}
Stack: ${data.stack}
Timeframe: ${data.timeframe}

Select only the chapters from the library that are most relevant to this
user. Return a JSON array of the selected modules with only the relevant
chapters inside each module. Omit modules that have no relevant chapters.`;
}

export const CLAUDE_TRAINING_DESCRIPTION = {
  headline: "Anthropic's free AI Fluency courses",
  what_it_covers: [
    "What AI and LLMs are — general concepts",
    "How to write better prompts — generic examples",
    "Overview of Claude features — not role-specific",
    "AI safety and responsible use basics",
  ],
  what_it_does_not_cover: [
    "Your specific sales funnel or where it is breaking",
    "Which tools work with your existing stack",
    "A week-by-week execution plan tied to your KPI",
    "Automations specific to your sales process",
  ],
  bottom_line:
    "Generic fluency training. Good starting point but not tied to your role, " +
    "your goal, or your 12-week number.",
};
