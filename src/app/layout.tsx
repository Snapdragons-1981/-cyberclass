import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberClass - Academic Command Center",
  description: "Cyberpunk-themed student academic task and assignment management system. Track assignments, manage courses, and stay organized.",
  keywords: ["student", "assignments", "tasks", "academic", "classroom", "productivity"],
  authors: [{ name: "CyberClass" }],
  openGraph: {
    title: "CyberClass - Academic Command Center",
    description: "Cyberpunk-themed student academic task and assignment management system.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CyberClass" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-gray-200">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f0f1a',
              border: '1px solid rgba(0, 255, 242, 0.15)',
              color: '#e0e0e0',
            },
          }}
        />
      </body>
    </html>
  );
}
