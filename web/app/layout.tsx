import type { Metadata } from "next";
import { IBM_Plex_Sans, Orbitron } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Providers } from "@/components/providers";
import { config } from "@/lib/wagmi/config";
import "./globals.css";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodySans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://evolution-simulator-two.vercel.app";

export const metadata: Metadata = {
  title: "Evolution Simulator",
  description: "Neon evolution field — Base daily check-in",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/app-icon.jpg",
  },
  openGraph: {
    images: [{ url: "/app-thumbnail.jpg", width: 1910, height: 1000 }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const initialState = cookieToInitialState(config, cookieHeader);
  const baseAppId =
    process.env.NEXT_PUBLIC_BASE_APP_ID ?? "69e5cb4559efa56c5c549f1c";

  return (
    <html lang="en" className={`${display.variable} ${bodySans.variable}`}>
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="min-h-dvh bg-void font-body text-zinc-100 antialiased">
        <div className="chromatic-wrap">
          <Providers initialState={initialState}>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
