import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Webhook Replay Toolkit",
    template: "%s | Webhook Replay Toolkit"
  },
  description:
    "Capture real Stripe, Shopify, and GitHub webhooks from production. Replay exact payloads to localhost, staging, or prod on demand.",
  keywords: [
    "webhook replay",
    "stripe webhook debugging",
    "shopify webhooks",
    "github webhook tester",
    "developer tools"
  ],
  openGraph: {
    title: "Webhook Replay Toolkit",
    description:
      "Capture and replay real production webhooks with full headers and payloads. Stop waiting for events to fire again.",
    type: "website",
    url: "/"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body>
        {children}
        <Toaster richColors theme="dark" position="top-right" closeButton />
      </body>
    </html>
  );
}
