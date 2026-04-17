"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const replaySchema = z.object({
  webhookId: z.string().min(2),
  targetUrl: z.string().url("Enter a valid URL, e.g. http://localhost:3000/api/webhooks"),
});

type ReplaySchema = z.infer<typeof replaySchema>;

type ReplayResult = {
  status?: number;
  durationMs?: number;
  data?: unknown;
  error?: string;
};

type WebhookReplayFormProps = {
  webhookId: string;
  defaultTarget?: string;
};

export function WebhookReplayForm({ webhookId, defaultTarget }: WebhookReplayFormProps) {
  const [result, setResult] = useState<ReplayResult | null>(null);

  const form = useForm<ReplaySchema>({
    resolver: zodResolver(replaySchema),
    defaultValues: {
      webhookId,
      targetUrl: defaultTarget ?? "http://localhost:3000/api/webhooks",
    },
  });

  async function onSubmit(values: ReplaySchema) {
    setResult(null);

    const response = await fetch("/api/webhooks/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as ReplayResult;
    setResult(payload);
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#30363d] bg-[#161b22] p-6">
      <h3 className="text-lg font-semibold text-[#f0f6fc]">Replay this webhook</h3>
      <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm text-[#8b949e]">Target endpoint</label>
          <Input {...form.register("targetUrl")} placeholder="http://localhost:3000/api/webhooks" />
          {form.formState.errors.targetUrl ? (
            <p className="mt-1 text-xs text-[#f85149]">{form.formState.errors.targetUrl.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Replaying..." : "Replay webhook"}
        </Button>
      </form>

      {result ? (
        <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-4 text-sm text-[#c9d1d9]">
          {result.error ? (
            <p className="text-[#f85149]">Replay failed: {result.error}</p>
          ) : (
            <>
              <p>
                Status: <span className="font-semibold">{result.status}</span>
              </p>
              <p>
                Duration: <span className="font-semibold">{result.durationMs}ms</span>
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
