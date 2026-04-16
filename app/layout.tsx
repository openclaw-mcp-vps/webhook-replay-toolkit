import type { Metadata } from "next";
import Script from "next/script";
import "@/app/globals.css";
import { Providers } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Webhook Replay Toolkit | Capture and Replay Production Webhooks",
  description:
    "Capture real Stripe, Shopify, and GitHub webhook payloads with headers, then replay them to localhost or staging in one click.",
  openGraph: {
    title: "Webhook Replay Toolkit",
    description: "Capture and replay production webhooks without waiting for events to fire again.",
    url: "https://webhook-replay-toolkit.com",
    siteName: "Webhook Replay Toolkit",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Webhook Replay Toolkit",
    description: "Capture and replay production webhooks against localhost and staging."
  },
  metadataBase: new URL("https://webhook-replay-toolkit.com")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
