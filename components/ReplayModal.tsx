"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Loader2, Play } from "lucide-react";
import { useMemo, useState } from "react";

type ReplayModalProps = {
  webhookId: string;
};

type ReplayResponse = {
  success: boolean;
  statusCode: number | null;
  durationMs: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  errorMessage: string | null;
};

export function ReplayModal({ webhookId }: ReplayModalProps) {
  const [open, setOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState("http://localhost:3000/api/webhooks");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReplayResponse | null>(null);

  const bodyPreview = useMemo(() => {
    if (!result?.responseBody) {
      return "";
    }

    return result.responseBody.length > 800
      ? `${result.responseBody.slice(0, 800)}\n\n...truncated`
      : result.responseBody;
  }, [result]);

  async function handleReplay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/webhooks/replay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ webhookId, targetUrl })
      });

      const payload = (await response.json()) as ReplayResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Replay failed");
      }

      setResult(payload);
    } catch (replayError) {
      const message =
        replayError instanceof Error ? replayError.message : "Replay failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        <Play className="h-4 w-4" />
        Replay Webhook
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-slate-950/80" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0f1723] p-6">
            <h2 className="text-xl font-semibold text-white">Replay Event</h2>
            <p className="mt-2 text-sm text-slate-400">
              Send this captured webhook to any endpoint, including localhost via
              ngrok or Cloudflare Tunnel.
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleReplay}>
              <div>
                <label className="block text-xs uppercase tracking-[0.16em] text-slate-500">
                  Target URL
                </label>
                <input
                  value={targetUrl}
                  onChange={(event) => setTargetUrl(event.target.value)}
                  type="url"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0b111c] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Replaying...
                    </>
                  ) : (
                    "Send Replay"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Close
                </button>
              </div>
            </form>

            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

            {result ? (
              <div className="mt-5 rounded-xl border border-slate-700 bg-[#0b111c] p-4">
                <p className="text-sm text-slate-200">
                  Replay result:{" "}
                  <span
                    className={`font-semibold ${
                      result.success ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {result.statusCode ? `HTTP ${result.statusCode}` : "Request error"}
                  </span>{" "}
                  in {result.durationMs}ms
                </p>

                {result.errorMessage ? (
                  <p className="mt-2 text-xs text-rose-300">{result.errorMessage}</p>
                ) : null}

                {bodyPreview ? (
                  <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-slate-700 bg-slate-950/70 p-3 font-[family-name:var(--font-plex-mono)] text-xs text-slate-200">
                    {bodyPreview}
                  </pre>
                ) : null}
              </div>
            ) : null}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
