import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#111927]/80 p-6">
      <h1 className="text-2xl font-bold text-white">Webhook not found</h1>
      <p className="mt-2 text-sm text-slate-400">
        This event does not exist or does not belong to your account.
      </p>
      <Link
        href="/dashboard/webhooks"
        className="mt-4 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white"
      >
        Back to webhook timeline
      </Link>
    </div>
  );
}
