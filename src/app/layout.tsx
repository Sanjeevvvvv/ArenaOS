import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { PWAProvider } from "@/components/shared/PWAProvider";
import { SimulationProvider } from "@/components/shared/SimulationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArenaOS | AI Smart Stadium Platform",
  description: "The AI Operating System for the World's Smartest Stadiums. Supporting FIFA World Cup 2026.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ArenaOS",
  },
  applicationName: "ArenaOS",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <PWAProvider>
          <SimulationProvider />
          <Header />
          <main className="flex-1 flex flex-col relative w-full">
            {children}
          </main>
        </PWAProvider>
      </body>
    </html>
  );
}
