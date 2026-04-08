/**
 * Root Layout
 *
 * This wraps every page in the app. It includes:
 * - Auth provider (tracks who's logged in)
 * - The gradient header at the top
 * - The bottom navigation tabs
 * - A centered container (max 400px) for the phone-like layout
 */

import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'Potluck Jackpot',
  description: 'A social recipe game that encourages people to cook together!',
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
