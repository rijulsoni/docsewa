import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DocSewa — Free Document Conversion Tools",
    template: "%s | DocSewa",
  },
  description:
    "Convert images to PDF, merge PDFs, split PDFs, convert PDF to images, and extract text — all free, fast, and secure. No installation required.",
  keywords: [
    "PDF converter",
    "image to PDF",
    "merge PDF",
    "split PDF",
    "PDF to image",
    "extract text",
    "OCR",
    "free PDF tools",
  ],
  openGraph: {
    title: "DocSewa — Free Document Conversion Tools",
    description:
      "Convert, merge, split and extract text from your documents. Fast, free, and secure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
