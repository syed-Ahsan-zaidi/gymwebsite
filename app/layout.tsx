import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner"; // 1. Ye import karein

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fitzone.sbs"),
  title: {
    default: "FlexManage Pro | Fitzone Gym Management",
    template: "%s | Fitzone",
  },
  description:
    "Fitzone ka smart gym management system — memberships, payments, schedules, aur progress tracking ek jagah.",
  keywords: [
    "gym management",
    "fitness management",
    "fitzone",
    "membership tracking",
    "gym software",
    "Pakistan gym",
  ],
  authors: [{ name: "Fitzone", url: "https://fitzone.sbs" }],
  creator: "Fitzone",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fitzone.sbs",
    siteName: "Fitzone",
    title: "FlexManage Pro | Fitzone Gym Management",
    description:
      "Fitzone ka smart gym management system — memberships, payments, schedules, aur progress tracking ek jagah.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fitzone Gym Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlexManage Pro | Fitzone Gym Management",
    description:
      "Fitzone ka smart gym management system — memberships, payments, schedules, aur progress tracking ek jagah.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        <Providers>
          {children}
          {/* 2. Toaster ko yahan add kar dein */}
          <Toaster richColors position="top-right" /> 
        </Providers>
      </body>
    </html>
  );
}
