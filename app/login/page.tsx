import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export const metadata = {
  title: "Sign In"
};

type SearchParamValue = string | string[] | undefined;

function toSingle(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const nextPath = toSingle(params.next) || "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-12">
      <div className="grid w-full gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <Link
            href="/"
            className="font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-[0.22em] text-cyan-300"
          >
            Webhook Replay Toolkit
          </Link>
          <h1 className="text-4xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-300">
            Sign in to access your capture URLs, webhook timeline, and replay
            controls.
          </p>
          <div className="rounded-xl border border-slate-800 bg-[#0f1826]/80 p-4 text-sm text-slate-300">
            Your dashboard stays behind authentication and a paid-access cookie,
            so only you can view and replay captured payloads.
          </div>
        </div>

        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
