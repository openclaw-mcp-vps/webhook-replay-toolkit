"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Mode = "login" | "register";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const registerResponse = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        if (!registerResponse.ok) {
          const payload = (await registerResponse.json()) as { error?: string };
          throw new Error(payload.error || "Registration failed");
        }
      }

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (!loginResult?.ok) {
        throw new Error("Invalid email or password");
      }

      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Request failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl shadow-cyan-900/10">
      <div className="mb-6 flex rounded-lg border border-slate-700/80 bg-slate-900/60 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`w-1/2 rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === "login"
              ? "bg-cyan-500 text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`w-1/2 rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === "register"
              ? "bg-cyan-500 text-slate-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Create Account
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <div>
            <label className="block text-xs uppercase tracking-[0.16em] text-slate-400">
              Full Name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0c121b] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              placeholder="Sasha Rivera"
            />
          </div>
        ) : null}

        <div>
          <label className="block text-xs uppercase tracking-[0.16em] text-slate-400">
            Work Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0c121b] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.16em] text-slate-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0c121b] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            placeholder="At least 8 characters"
          />
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : mode === "login" ? (
            "Continue to Dashboard"
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}
