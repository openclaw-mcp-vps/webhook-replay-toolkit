"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthPanel() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      callbackUrl: "/dashboard",
      redirect: false
    });

    if (result?.ok) {
      window.location.href = "/dashboard";
      return;
    }

    setMessage("Login failed. Check your credentials and try again.");
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword
      })
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setMessage(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: registerEmail,
      password: registerPassword,
      callbackUrl: "/dashboard",
      redirect: false
    });

    if (signInResult?.ok) {
      window.location.href = "/dashboard";
      return;
    }

    setMessage("Account created. Please sign in.");
    setLoading(false);
  }

  return (
    <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="grid gap-2">
        <h3 className="text-xl font-semibold text-white">Start capturing in 2 minutes</h3>
        <p className="text-sm text-slate-300">
          Create an account to get a unique capture endpoint and access the replay dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form className="grid gap-3" onSubmit={handleRegister}>
          <h4 className="font-medium text-slate-100">Create account</h4>
          <Input
            required
            placeholder="Full name"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
          />
          <Input
            required
            type="email"
            placeholder="you@company.com"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
          />
          <Input
            required
            minLength={8}
            type="password"
            placeholder="At least 8 characters"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <Button disabled={loading} type="submit">
            {loading ? "Working..." : "Create account"}
          </Button>
        </form>

        <form className="grid gap-3" onSubmit={handleLogin}>
          <h4 className="font-medium text-slate-100">Sign in</h4>
          <Input
            required
            type="email"
            placeholder="you@company.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <Input
            required
            type="password"
            placeholder="Your password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <Button disabled={loading} type="submit" variant="secondary">
            {loading ? "Working..." : "Sign in"}
          </Button>
        </form>
      </div>

      {message ? <p className="text-sm text-sky-300">{message}</p> : null}
    </section>
  );
}
