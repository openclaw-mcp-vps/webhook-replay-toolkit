"use client";

import { useState } from "react";

type ReplayFormProps = {
  webhookId: string;
};

export function ReplayForm({ webhookId }: ReplayFormProps) {
  const [targetUrl, setTargetUrl] = useState("https://");
  const [forwardOriginalHeaders, setForwardOriginalHeaders] = useState(true);
  const [timeoutMs, setTimeoutMs] = useState(8000);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
          const response = await fetch("/api/webhooks/replay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ webhookId, targetUrl, forwardOriginalHeaders, timeoutMs })
          });

          const payload = (await response.json()) as { ok: boolean; message: string };

          if (!response.ok || !payload.ok) {
            throw new Error(payload.message || "Replay failed");
          }

          setStatus(payload.message);
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Replay failed");
        } finally {
          setLoading(false);
        }
      }}
    >
      <h3 className="text-base font-semibold">Replay this webhook</h3>
      <label className="block text-sm text-[var(--muted)]">
        Target URL
        <input
          value={targetUrl}
          onChange={(event) => setTargetUrl(event.target.value)}
          type="url"
          required
          className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[#0b0f14] px-3 text-sm"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <input
          type="checkbox"
          checked={forwardOriginalHeaders}
          onChange={(event) => setForwardOriginalHeaders(event.target.checked)}
        />
        Forward original headers
      </label>
      <label className="block text-sm text-[var(--muted)]">
        Timeout (ms)
        <input
          value={timeoutMs}
          onChange={(event) => setTimeoutMs(Number(event.target.value))}
          type="number"
          min={1000}
          max={30000}
          className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[#0b0f14] px-3 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#051b0a] hover:bg-[var(--accent-2)] disabled:opacity-60"
      >
        {loading ? "Replaying..." : "Replay now"}
      </button>
      {status ? <p className="text-xs text-[var(--muted)]">{status}</p> : null}
    </form>
  );
}
