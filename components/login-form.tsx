"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (session?.user?.email) {
    return (
      <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
        <span>Signed in as {session.user.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--text)] hover:bg-[var(--surface)]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false
        });

        if (result?.error) {
          setError("Sign in failed. Use a valid email and password with at least 8 characters.");
        }
      }}
    >
      <input
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        required
      />
      <input
        type="password"
        placeholder="Password (8+ chars)"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        required
      />
      <button
        type="submit"
        className="h-10 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-[#051b0a] hover:bg-[var(--accent-2)]"
      >
        Sign in
      </button>
      {error ? <p className="text-xs text-red-400 sm:ml-2">{error}</p> : null}
    </form>
  );
}
