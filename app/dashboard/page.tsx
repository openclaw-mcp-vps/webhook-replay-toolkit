import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/paywall";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const isPaid = await hasPaidAccess(session.user.id);

  const [webhookCount, recentCount] = await Promise.all([
    db.webhookEvent.count({ where: { userId: session.user.id } }),
    db.webhookEvent.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || process.env.NEXT_PUBLIC_APP_HOST || "localhost:3000";

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-[#9ba5b3]">Capture endpoint for your account: <span className="font-mono text-[#58a6ff]">https://{session.user.id}.{host}/api/capture/{session.user.id}</span></p>
        </div>
        <SignOutButton />
      </header>

      {!isPaid ? (
        <Card className="border-[#d2992255]">
          <CardHeader>
            <CardTitle>Upgrade required</CardTitle>
            <CardDescription>You can sign in for free, but replay and webhook history are part of the $15/month Pro plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/#pricing">Unlock Pro</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total captures</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-[#3fb950]">{webhookCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last 24 hours</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold text-[#58a6ff]">{recentCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Replay status</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#9ba5b3]">{isPaid ? "Enabled for all captured events" : "Upgrade to replay captured events"}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook workflow</CardTitle>
          <CardDescription>Open your captured events and replay exact payloads against local or remote environments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/webhooks">View captured webhooks</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
