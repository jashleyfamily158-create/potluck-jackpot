/**
 * Header Component
 *
 * The sticky header at the top of every screen.
 * Shows the app name with a warm gradient background.
 * Shows login/signup links or the user's name + logout.
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface HeaderProps {
  title?: string
  showBack?: boolean
}

export default function Header({ title = 'Potluck Jackpot', showBack = false }: HeaderProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 gradient-primary px-5 py-3 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="text-white text-2xl font-bold leading-none"
          aria-label="Go back"
        >
          ←
        </button>
      )}
      <h1 className="text-white text-xl font-extrabold tracking-tight flex-1">
        {title}
      </h1>

      {/* Auth status */}
      <div className="text-white text-xs">
        {user ? (
          <button
            onClick={signOut}
            className="bg-white/20 px-3 py-1.5 rounded-lg font-semibold hover:bg-white/30 transition-colors"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="bg-white/20 px-3 py-1.5 rounded-lg font-semibold hover:bg-white/30 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
