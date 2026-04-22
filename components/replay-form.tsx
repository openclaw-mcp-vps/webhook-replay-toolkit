"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ReplayFormProps = {
  webhookId: string;
  defaultMethod: string;
};

const replaySchema = z.object({
  targetUrl: z
    .string()
    .url("Enter a full URL like http://localhost:3000/api/webhooks/stripe")
    .refine((value) => /^https?:\/\//.test(value), {
      message: "Only http:// or https:// targets are supported"
    }),
  method: z.enum(["POST", "PUT", "PATCH"]),
  timeoutMs: z.coerce.number().int().min(1000).max(45000),
  preserveHeaders: z.boolean().default(true)
});

type ReplayFormValues = z.infer<typeof replaySchema>;

type ReplayResponse = {
  statusCode: number;
  durationMs: number;
  replayQueued: boolean;
};

export function ReplayForm({ webhookId, defaultMethod }: ReplayFormProps) {
  const router = useRouter();
  const [result, setResult] = useState<ReplayResponse | null>(null);

  const form = useForm<ReplayFormValues>({
    resolver: zodResolver(replaySchema),
    defaultValues: {
      targetUrl: "http://localhost:3000/api/webhooks/replay-debug",
      method: defaultMethod === "GET" || defaultMethod === "DELETE" ? "POST" : (defaultMethod as "POST" | "PUT" | "PATCH"),
      timeoutMs: 12000,
      preserveHeaders: true
    }
  });

  const onSubmit = async (values: ReplayFormValues) => {
    try {
      const response = await fetch("/api/replay", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          webhookId,
          ...values
        })
      });

      const payload = (await response.json()) as ReplayResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Replay failed.");
      }

      setResult(payload);
      toast.success(`Replay sent. Target responded with ${payload.statusCode}.`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Replay failed.";
      toast.error(message);
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-sky-300" />
          Replay Event
        </CardTitle>
        <CardDescription>
          Send this exact payload to localhost, staging, or production with optional original headers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="targetUrl">
              Target endpoint
            </label>
            <Input id="targetUrl" placeholder="http://localhost:3000/api/webhooks/stripe" {...form.register("targetUrl")} />
            {form.formState.errors.targetUrl ? (
              <p className="text-sm text-red-300">{form.formState.errors.targetUrl.message}</p>
            ) : (
              <p className="text-xs text-slate-500">Use full URL format. `localhost` works when this app runs locally.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="method">
                HTTP method
              </label>
              <select
                id="method"
                className="h-10 w-full rounded-lg border border-slate-700 bg-[#0d1117] px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                {...form.register("method")}
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="timeoutMs">
                Timeout (ms)
              </label>
              <Input id="timeoutMs" type="number" min={1000} max={45000} step={500} {...form.register("timeoutMs")} />
            </div>

            <div className="flex items-end pb-1">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700 bg-[#0d1117] text-sky-500"
                  {...form.register("preserveHeaders")}
                />
                Preserve original headers
              </label>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
            Replay Webhook
          </Button>
        </form>

        {result ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-[#0d1117]/80 p-3 text-xs text-slate-300">
            <span>Latest replay result:</span>
            <Badge variant={result.statusCode >= 200 && result.statusCode < 300 ? "success" : "warning"}>
              {result.statusCode}
            </Badge>
            <span>{result.durationMs} ms</span>
            {result.replayQueued ? <Badge variant="info">Queued in Redis</Badge> : <Badge>Queue skipped</Badge>}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
