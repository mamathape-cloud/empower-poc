export interface IntakeData {
  goal: string;
  role: string;
  funnelStage: string;
  stack: string;
  timeframe: string;
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
