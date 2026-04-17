import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Webhook Replay Toolkit",
  description:
    "Capture real Stripe, Shopify, and GitHub webhooks and replay them against localhost, staging, or prod.",
  openGraph: {
    title: "Webhook Replay Toolkit",
    description:
      "Record production webhook payloads with full headers and replay them on demand to debug webhook failures faster.",
    type: "website",
    url: "/",
    siteName: "Webhook Replay Toolkit"
  },
  twitter: {
    card: "summary_large_image",
    title: "Webhook Replay Toolkit",
    description:
      "Capture and replay webhook payloads from Stripe, Shopify, GitHub, Slack, Resend, and Postmark."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-[#0d1117] text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
