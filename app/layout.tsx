import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://webhookreplaytoolkit.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Webhook Replay Toolkit | Capture and Replay Production Webhooks",
  description:
    "Capture real Stripe, Shopify, GitHub, Slack, and Resend webhook payloads in production, then replay them against localhost or staging on demand.",
  openGraph: {
    title: "Webhook Replay Toolkit",
    description:
      "Stop waiting for failed webhooks to fire again. Capture once, replay anytime against localhost, staging, or production.",
    url: siteUrl,
    siteName: "Webhook Replay Toolkit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webhook Replay Toolkit",
    description:
      "Record real production webhooks and replay them on demand. Built for Stripe, Shopify, GitHub, Slack, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
