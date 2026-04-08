/**
 * Root Layout
 *
 * This wraps every page in the app. It includes:
 * - Auth provider (tracks who's logged in)
 * - The gradient header at the top
 * - The bottom navigation tabs
 * - A centered container (max 400px) for the phone-like layout
 *
 * The metadata section controls what shows up when someone shares
 * the app link on Facebook, iMessage, Slack, Twitter, etc.
 * The openGraph block generates the nice preview card with image.
 */

import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { AuthProvider } from '@/lib/auth-context'

const APP_URL = 'https://potluck-jackpot.vercel.app'

export const metadata: Metadata = {
  title: 'Potluck Jackpot 🎰',
  description: 'Spin the wheel, get a recipe, cook it, and bring it to the party! The social recipe game for friend groups.',
  metadataBase: new URL(APP_URL),

  // Open Graph — used by Facebook, iMessage, Slack, LinkedIn, Discord, etc.
  openGraph: {
    title: 'Potluck Jackpot 🎰',
    description: 'Spin the wheel, cook a dish, bring it to the party! Join the fun social recipe game.',
    url: APP_URL,
    siteName: 'Potluck Jackpot',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Potluck Jackpot — The social recipe game',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter / X card
  twitter: {
    card: 'summary_large_image',
    title: 'Potluck Jackpot 🎰',
    description: 'Spin the wheel, cook a dish, bring it to the party!',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#F8F9FA]">
        <AuthProvider>
          {/* Phone-like centered container */}
          <div className="max-w-[400px] mx-auto min-h-screen bg-[#F8F9FA] relative">
            <Header />

            {/* Main content area — padded so it doesn't hide behind nav */}
            <main className="px-5 py-4 pb-20">
              {children}
            </main>

            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
