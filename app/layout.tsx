import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"]
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "Webhook Replay Toolkit",
    template: "%s | Webhook Replay Toolkit"
  },
  description:
    "Capture live Stripe, Shopify, and GitHub webhooks and replay them against localhost or staging in seconds.",
  keywords: [
    "webhook replay",
    "stripe webhooks",
    "shopify webhooks",
    "github webhooks",
    "developer tools"
  ],
  openGraph: {
    title: "Webhook Replay Toolkit",
    description:
      "Capture every webhook request with full headers + body and replay against any endpoint on demand.",
    url: "/",
    siteName: "Webhook Replay Toolkit",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "Webhook Replay Toolkit"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Webhook Replay Toolkit",
    description:
      "Stop waiting for production webhooks to fire again. Capture once, replay forever.",
    images: ["/og-image"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-[var(--background)] font-[family-name:var(--font-space-grotesk)] text-[var(--text)] antialiased">
        {children}
      </body>
    </html>
  );
}
