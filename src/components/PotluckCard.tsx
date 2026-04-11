/**
 * Potluck Card Component
 *
 * Displays a potluck summary in a card format.
 * Used on the home screen for both active and past potlucks.
 */

import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { findTheme } from '@/lib/event-themes'

interface PotluckCardProps {
  id: string
  name: string
  cuisineTheme: string
  cuisineEmoji: string
  eventTheme?: string | null     // optional vibe/occasion theme name
  eventDate?: string
  location?: string
  memberCount: number
  status: string
}

export default function PotluckCard({
  id,
  name,
  cuisineEmoji,
  cuisineTheme,
  eventTheme,
  eventDate,
  location,
  memberCount,
  status,
}: PotluckCardProps) {
  // Look up the event theme details (color, emoji) if one was set
  const themeDetails = eventTheme ? findTheme(eventTheme) : null
  // Color-code the status badge
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    spinning: 'bg-purple-100 text-purple-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  }

  return (
    <Link href={`/potluck/${id}`}>
      <div className="bg-white rounded-2xl p-4 card-shadow hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          {/* Cuisine emoji as the card icon */}
          <div className="text-3xl">{cuisineEmoji}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 truncate">{name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[status] || statusColors.pending}`}>
                {status}
              </span>
            </div>

            <p className="text-sm text-gray-500">{cuisineTheme} cuisine</p>

            {/* Event theme pill — only shown if the host set a vibe theme */}
            {themeDetails && (
              <div
                className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: themeDetails.color }}
              >
                <span>{themeDetails.emoji}</span>
                <span>{themeDetails.name}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {eventDate && (
                <span>📅 {formatDate(eventDate)}</span>
              )}
              {location && (
                <span>📍 {location}</span>
              )}
              <span>👥 {memberCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
