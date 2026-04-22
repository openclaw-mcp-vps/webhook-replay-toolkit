import Link from "next/link";
import { BarChart3, LogOut, Radar, Webhook } from "lucide-react";

import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 pb-16 pt-8 sm:px-8 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-950/60 text-sky-300">
            <Webhook className="h-4 w-4" />
          </div>
          Webhook Replay Toolkit
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/webhooks" className="inline-flex items-center gap-2">
              <Radar className="h-4 w-4" />
              Webhooks
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/api/access/logout" className="inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Lock
            </a>
          </Button>
        </nav>
      </header>

      {children}
    </main>
  );
}
