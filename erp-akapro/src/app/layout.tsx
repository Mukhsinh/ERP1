import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AKAPRO ERP - SAK Integrated Enterprise",
  description: "Enterprise ERP System patuh terhadap Standar Akuntansi Keuangan Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
