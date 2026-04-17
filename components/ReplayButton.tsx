"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReplayResult = {
  statusCode: number;
  durationMs: number;
  responseBody: string;
};

export function ReplayButton({ webhookId }: { webhookId: string }) {
  const [targetUrl, setTargetUrl] = useState("http://localhost:3000/api/webhooks/test");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReplayResult | null>(null);
  const [error, setError] = useState("");

  async function runReplay() {
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/webhooks/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookId, targetUrl })
    });

    const data = (await res.json()) as ReplayResult & { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Replay request failed.");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  return (
    <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-4">
      <label className="text-sm text-slate-300" htmlFor="targetUrl">
        Replay target URL
      </label>
      <Input id="targetUrl" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} />
      <Button disabled={loading || !targetUrl} onClick={runReplay}>
        {loading ? "Replaying..." : "Replay webhook"}
      </Button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {result ? (
        <p className="text-sm text-emerald-300">
          Response {result.statusCode} in {result.durationMs}ms
        </p>
      ) : null}
    </div>
  );
}
