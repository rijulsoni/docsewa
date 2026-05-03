import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { UpgradeModal } from "@/components/modals/UpgradeModal";

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
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        layout: {
          logoPlacement: 'none',
          socialButtonsVariant: 'blockButton',
        },
        variables: {
          colorPrimary: '#7c3aed',
          colorBackground: '#0f0f14',
          colorForeground: '#f8fafc',
          colorMuted: '#18181f',
          colorMutedForeground: '#a1a1aa',
          colorInput: '#ffffff',
          colorInputForeground: '#111827',
          colorBorder: 'rgba(255, 255, 255, 0.12)',
          colorModalBackdrop: '#020204',
          colorShadow: '#000000',
          borderRadius: '0.9rem',
          fontFamily: 'inherit',
        },
        elements: {
          modalBackdrop: {
            backgroundColor: 'rgba(2, 2, 4, 0.82)',
            backdropFilter: 'blur(8px)',
          },
          modalContent: {
            width: 'min(92vw, 30rem)',
            maxWidth: '30rem',
            backgroundColor: '#0f0f14',
            borderRadius: '1.25rem',
          },
          modalCloseButton: {
            color: 'rgba(255, 255, 255, 0.55)',
            '&:hover': {
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          },
          cardBox: {
            width: 'min(92vw, 30rem)',
            maxWidth: '30rem',
            backgroundColor: '#0f0f14',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: '1.25rem',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.55)',
          },
          card: {
            backgroundColor: '#0f0f14',
            padding: '2.25rem',
          },
          headerTitle: {
            color: '#f8fafc',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '0',
          },
          headerSubtitle: {
            color: '#a1a1aa',
          },
          socialButtonsBlockButton: {
            height: '2.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            color: '#f4f4f5',
            borderRadius: '0.8rem',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              borderColor: 'rgba(255, 255, 255, 0.18)',
            },
          },
          socialButtonsBlockButtonText: {
            color: '#f4f4f5',
            fontWeight: 600,
          },
          socialButtonsIconButton: {
            height: '2.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '0.8rem',
            color: '#ffffff',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.13)',
              borderColor: 'rgba(255, 255, 255, 0.24)',
            },
          },
          socialButtonsProviderIcon: {
            opacity: 1,
          },
          dividerText: {
            color: '#71717a',
          },
          dividerLine: {
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
          },
          formFieldLabel: {
            color: '#d4d4d8',
            fontWeight: 500,
          },
          formFieldInput: {
            height: '2.75rem',
            backgroundColor: '#ffffff',
            border: '1px solid transparent',
            borderRadius: '0.85rem',
            color: '#111827',
            boxShadow: 'none',
            '&::placeholder': {
              color: '#6b7280',
            },
            '&:focus': {
              borderColor: '#8b5cf6',
              boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.22)',
            },
          },
          formButtonPrimary: {
            height: '2.75rem',
            background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
            borderRadius: '0.85rem',
            color: '#ffffff',
            fontWeight: 700,
            boxShadow: '0 14px 30px rgba(124, 58, 237, 0.28)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
            },
          },
          footer: {
            backgroundColor: '#0f0f14',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          },
          footerActionText: {
            color: '#a1a1aa',
          },
          footerActionLink: {
            color: '#a78bfa',
            fontWeight: 700,
            '&:hover': {
              color: '#c4b5fd',
            },
          },
          badge: {
            backgroundColor: 'rgba(124, 58, 237, 0.14)',
            color: '#ddd6fe',
            border: '1px solid rgba(167, 139, 250, 0.22)',
          },
          userButtonPopoverRootBox: {
            zIndex: 60,
          },
          userButtonPopoverCard: {
            width: '23.5rem',
            backgroundColor: '#0f0f14',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: '1.25rem',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.55)',
            overflow: 'hidden',
          },
          userButtonPopoverMain: {
            backgroundColor: '#0f0f14',
          },
          userPreviewMainIdentifier: {
            color: '#f8fafc',
            fontWeight: 700,
          },
          userPreviewSecondaryIdentifier: {
            color: '#a1a1aa',
          },
          userButtonPopoverActionButton: {
            color: '#e4e4e7',
            backgroundColor: 'transparent',
            '&:hover': {
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          },
          userButtonPopoverActionButtonIcon: {
            color: '#a78bfa',
          },
          userButtonPopoverFooter: {
            backgroundColor: '#121218',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      }}
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
          <Toaster richColors position="top-right" />
          <UpgradeModal />
        </body>
      </html>
    </ClerkProvider>
  );
}
