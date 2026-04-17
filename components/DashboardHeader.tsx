"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({ email }: { email: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500">Webhook Replay Toolkit</p>
        <p className="text-sm text-slate-200">Signed in as {email}</p>
      </div>
      <div className="flex gap-2">
        <a
          className="inline-flex h-10 items-center rounded-md border border-slate-700 px-4 text-sm text-slate-200 hover:border-sky-400"
          href="/dashboard/webhooks"
        >
          Captures
        </a>
        <Button onClick={() => signOut({ callbackUrl: "/" })} variant="secondary">
          Sign out
        </Button>
      </div>
    </header>
  );
}
