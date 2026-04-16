"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      name,
      callbackUrl: "/dashboard",
      redirect: true
    });

    if (result?.error) {
      setError("Unable to sign in right now.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-[#30363d] bg-[#161b22] p-4">
      <h3 className="text-sm font-semibold text-[#e6edf3]">Get started free</h3>
      <Input
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Open dashboard"}
      </Button>
      {error ? <p className="text-xs text-[#f85149]">{error}</p> : null}
    </form>
  );
}
