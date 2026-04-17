import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://webhook-replay-toolkit.com"),
  title: "Webhook Replay Toolkit | Capture and Replay Stripe, Shopify, GitHub Webhooks",
  description:
    "Capture real production webhook payloads with full headers and body, then replay them against localhost or staging in seconds.",
  openGraph: {
    title: "Webhook Replay Toolkit",
    description:
      "Stop waiting for failed webhooks to fire again. Capture once, replay anywhere.",
    url: "https://webhook-replay-toolkit.com",
    siteName: "Webhook Replay Toolkit",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Webhook Replay Toolkit",
    description: "Capture real webhooks and replay against localhost, staging, or prod."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
