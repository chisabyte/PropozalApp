import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export const metadata: Metadata = {
  title: {
    default: "Propozzy - AI-Powered Proposal Generator",
    template: "%s | Propozzy",
  },
  description: "Transform generic RFPs into customized, professional proposals in under 2 minutes using AI. Win more projects with personalized, high-converting proposals.",
  keywords: ["proposal generator", "AI proposals", "freelance", "RFP", "business proposals", "Upwork", "Fiverr"],
  authors: [{ name: "Propozzy" }],
  creator: "Propozzy",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://propozzy.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Propozzy",
    title: "Propozzy - AI-Powered Proposal Generator",
    description: "Transform generic RFPs into customized, professional proposals in under 2 minutes using AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Propozzy - AI-Powered Proposal Generator",
    description: "Transform generic RFPs into customized, professional proposals in under 2 minutes using AI.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <Header />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}

