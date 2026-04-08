/**
 * Bottom Navigation Component
 *
 * Sticky bottom tab bar with 4 tabs: Home, Feed, Friends, Rankings.
 * Highlights the active tab based on the current URL path.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// The four main tabs in the app
const tabs = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Feed', path: '/feed', icon: '📸' },
  { name: 'Friends', path: '/friends', icon: '👥' },
  { name: 'Rankings', path: '/rankings', icon: '🏆' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-[400px] mx-auto flex">
        {tabs.map((tab) => {
          // Check if this tab is the active one
          const isActive = tab.path === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.path)

          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive
                  ? 'text-orange-500 font-semibold'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
