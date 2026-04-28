"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import type { IntakeData } from "@/lib/prompts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const emptyForm: IntakeData = {
  goal: "",
  role: "",
  funnelStage: "",
  stack: "",
  timeframe: "",
};

const FUNNEL_STAGES = [
  "Lead Generation",
  "Qualification (MQL)",
  "Outreach",
  "Getting a Response",
  "Proposal",
  "Negotiation",
  "Closing",
] as const;

type FieldKey = keyof IntakeData;

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<IntakeData>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends FieldKey>(key: K, value: IntakeData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): boolean {
    const next: Partial<Record<FieldKey, string>> = {};
    (Object.keys(emptyForm) as FieldKey[]).forEach((key) => {
      if (!form[key].trim()) {
        next[key] = "This field is required.";
      }
    });
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setSubmitError("Something went wrong. Please try again.");
        return;
      }

      const data: unknown = await res.json();
      sessionStorage.setItem("empowerResults", JSON.stringify(data));
      router.push("/results");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-100 px-4 py-12">
      <div className="w-full max-w-[640px] rounded-lg border border-zinc-200/80 bg-white p-10 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-[#1F3A5F] md:text-4xl">
          Empower AI Pathways — Sales
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Tell us your goal. We will build your plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="goal">What is your sales goal?</Label>
            <Textarea
              id="goal"
              value={form.goal}
              onChange={(e) => setField("goal", e.target.value)}
              placeholder="e.g. I want to lift my team's win rate from 22% to 28% this quarter"
              rows={4}
              aria-invalid={!!fieldErrors.goal}
              className="min-h-[100px] resize-y"
            />
            {fieldErrors.goal ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.goal}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your role</Label>
            <Input
              id="role"
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
              placeholder="e.g. VP Sales, Head of Sales, CRO"
              aria-invalid={!!fieldErrors.role}
            />
            {fieldErrors.role ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.role}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="funnelStage">Where is your sales funnel leaking?</Label>
            <Select
              value={form.funnelStage || undefined}
              onValueChange={(v) => setField("funnelStage", v)}
            >
              <SelectTrigger
                id="funnelStage"
                className="w-full min-w-0"
                aria-invalid={!!fieldErrors.funnelStage}
              >
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
              <SelectContent>
                {FUNNEL_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.funnelStage ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.funnelStage}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stack">What tools does your team use?</Label>
            <Input
              id="stack"
              value={form.stack}
              onChange={(e) => setField("stack", e.target.value)}
              placeholder="e.g. Salesforce, Claude, Zoom"
              aria-invalid={!!fieldErrors.stack}
            />
            {fieldErrors.stack ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.stack}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">How long do you have to hit your goal?</Label>
            <Input
              id="timeframe"
              value={form.timeframe}
              onChange={(e) => setField("timeframe", e.target.value)}
              placeholder="e.g. 12 weeks, this quarter"
              aria-invalid={!!fieldErrors.timeframe}
            />
            {fieldErrors.timeframe ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.timeframe}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full gap-2 bg-[#1F3A5F] text-base font-medium text-white hover:bg-[#1F3A5F]/90 disabled:opacity-90"
            >
              {loading ? (
                <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
              ) : null}
              Build my plan →
            </Button>
            {submitError ? (
              <p className="text-center text-sm text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
