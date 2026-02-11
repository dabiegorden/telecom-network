import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
//@ts-ignore
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  title: "TelecomNet Ghana",
  description:
    "Connecting Telecom Professionals in Ghana - Join the Premier Networking Platform for Industry Insights, Career Growth, and Collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
