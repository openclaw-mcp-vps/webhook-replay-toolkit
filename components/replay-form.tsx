"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ReplayFormProps = {
  webhookId: string;
};

export function ReplayForm({ webhookId }: ReplayFormProps) {
  const [targetUrl, setTargetUrl] = useState("http://localhost:3000/api/webhooks/test");
  const [includeOriginalHeaders, setIncludeOriginalHeaders] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/replay", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ webhookId, targetUrl, includeOriginalHeaders })
      });

      const data = (await response.json()) as { status?: number; statusText?: string; data?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Replay failed.");
      }

      setResult(`Status ${data.status} ${data.statusText}\n\n${data.data || ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Replay failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Replay webhook</CardTitle>
        <CardDescription>Send this exact payload to localhost, staging, or production with one click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label htmlFor="target-url" className="text-sm font-medium text-[#c9d1d9]">Target endpoint URL</label>
            <Input
              id="target-url"
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              placeholder="https://staging.example.com/webhooks/stripe"
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#c9d1d9]">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={includeOriginalHeaders}
              onChange={(event) => setIncludeOriginalHeaders(event.target.checked)}
            />
            Include original webhook headers
          </label>
          <Button type="submit" disabled={loading}>{loading ? "Replaying..." : "Replay now"}</Button>
        </form>
        {error ? <p className="mt-4 text-sm text-[#f85149]">{error}</p> : null}
        {result ? (
          <pre className="mt-4 max-h-[260px] overflow-auto rounded-md border border-[#30363d] bg-[#0d1117] p-3 text-xs text-[#c9d1d9]">
            {result}
          </pre>
        ) : null}
      </CardContent>
    </Card>
  );
}
