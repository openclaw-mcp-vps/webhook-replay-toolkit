"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400 hover:text-white"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
