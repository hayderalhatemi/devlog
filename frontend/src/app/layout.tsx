import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevLog – Issue Tracker",
  description:
    "DevLog is a full-stack issue tracking application inspired by Jira, built with Next.js, TypeScript, Node.js, Express, Prisma and PostgreSQL.",
  openGraph: {
    title: "DevLog – Issue Tracker",
    description:
      "DevLog is a full-stack issue tracking application inspired by Jira, built with Next.js, TypeScript, Node.js, Express, Prisma and PostgreSQL.",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}