/**
 * Home Screen
 *
 * The main landing page of the app. Shows:
 * - A welcome banner with quick action buttons (Create / Join)
 * - "Next Up" spotlight card — the soonest upcoming potluck with a countdown
 * - Active potlucks the user is part of
 * - Past potlucks history
 *
 * If the user isn't logged in, shows a sign-up prompt.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PotluckCard from '@/components/PotluckCard'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { CUISINE_THEMES } from '@/lib/utils'

interface PotluckData {
  id: string
  name: string
  cuisine_theme: string
  event_date: string | null
  location: string | null
  status: string
  potluck_members: { count: number }[]
}

// Calculate a human-readable countdown to a date string like "2026-04-15"
function getCountdown(dateStr: string): string {
  const eventDate = new Date(dateStr + 'T00:00:00')
  const now = new Date()

  // Reset now to start of today for a clean day count
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

  const diffMs = eventDay.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Already happened'
  if (diffDays === 0) return '🎉 Today!'
  if (diffDays === 1) return '⏰ Tomorrow!'
  if (diffDays <= 7) return `${diffDays} days away`
  if (diffDays <= 14) return 'Next week'
  return `${diffDays} days away`
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [potlucks, setPotlucks] = useState<PotluckData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPotlucks() {
      if (!user) {
        setLoading(false)
        return
      }

      // Get all potlucks where the user is a member
      const { data: memberOf } = await supabase
        .from('potluck_members')
        .select('potluck_id')
        .eq('user_id', user.id)

      const potluckIds = memberOf?.map(m => m.potluck_id) || []

      // Also get potlucks the user hosts
      const { data: hosted } = await supabase
        .from('potlucks')
        .select('id')
        .eq('host_id', user.id)

      hosted?.forEach(h => {
        if (!potluckIds.includes(h.id)) potluckIds.push(h.id)
      })

      if (potluckIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: potlucksData } = await supabase
        .from('potlucks')
        .select('id, name, cuisine_theme, event_date, location, status, potluck_members(count)')
        .in('id', potluckIds)
        .order('created_at', { ascending: false })

      if (potlucksData) {
        setPotlucks(potlucksData as unknown as PotluckData[])
      }
      setLoading(false)
    }

    if (!authLoading) fetchPotlucks()
  }, [user, authLoading])

  // Helper to find the emoji for a cuisine theme
  function getEmoji(theme: string) {
    return CUISINE_THEMES.find(c => c.name === theme)?.emoji || '🍽️'
  }

  const activePotlucks = potlucks.filter(p => p.status !== 'completed')
  const pastPotlucks = potlucks.filter(p => p.status === 'completed')

  // Find the soonest upcoming potluck that has a date set
  const nextPotluck = activePotlucks
    .filter(p => p.event_date)
    .sort((a, b) => {
      const dateA = new Date(a.event_date!).getTime()
      const dateB = new Date(b.event_date!).getTime()
      return dateA - dateB
    })[0]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="gradient-primary rounded-2xl p-5 text-white">
        <h2 className="text-2xl font-extrabold mb-1">
          {user ? 'Ready to Cook? 🎰' : 'Welcome to Potluck Jackpot! 🎰'}
        </h2>
        <p className="text-sm opacity-90 mb-4">
          Spin the wheel, cook a dish, bring it to the party!
        </p>

        {/* Quick action buttons */}
        <div className="flex gap-3">
          <Link
            href={user ? '/potluck/create' : '/signup'}
            className="flex-1 bg-white text-orange-500 font-bold text-sm text-center py-3 rounded-xl hover:bg-orange-50 transition-colors"
          >
            🎉 Create Potluck
          </Link>
          <Link
            href={user ? '/potluck/join' : '/login'}
            className="flex-1 bg-white/20 text-white font-bold text-sm text-center py-3 rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
          >
            🎟️ Join with Code
          </Link>
        </div>
      </div>

      {/* Not logged in prompt */}
      {!authLoading && !user && (
        <div className="bg-white rounded-2xl p-5 card-shadow text-center">
          <p className="text-gray-500 text-sm mb-3">
            Sign up to create and join potlucks with your friends!
          </p>
          <Link
            href="/signup"
            className="inline-block gradient-primary text-white font-bold text-sm py-2.5 px-6 rounded-xl"
          >
            Get Started Free
          </Link>
        </div>
      )}

      {/* Loading state */}
      {loading && user && (
        <p className="text-center text-gray-400 text-sm py-8">Loading your potlucks...</p>
      )}

      {/* ✨ Next Up spotlight — shows the soonest upcoming potluck with countdown */}
      {nextPotluck && (
        <Link href={`/potluck/${nextPotluck.id}`} className="block">
          <div className="bg-white rounded-2xl p-4 card-shadow border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">⚡ Next Up</span>
              <span className="text-xs font-bold text-orange-400 bg-orange-50 px-2.5 py-1 rounded-full">
                {getCountdown(nextPotluck.event_date!)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getEmoji(nextPotluck.cuisine_theme)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-gray-900 truncate">{nextPotluck.name}</p>
                <p className="text-xs text-gray-500">
                  {nextPotluck.cuisine_theme} cuisine
                  {nextPotluck.location ? ` · ${nextPotluck.location}` : ''}
                </p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </div>
            {/* Mini progress bar — shows spin status */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>
                  {nextPotluck.status === 'pending' && '⏳ Gathering guests'}
                  {nextPotluck.status === 'spinning' && '🎰 Spin phase active!'}
                  {nextPotluck.status === 'active' && '⭐ Rating in progress'}
                </span>
                <span>{nextPotluck.potluck_members?.[0]?.count || 0} guests</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary transition-all"
                  style={{
                    width: nextPotluck.status === 'pending' ? '25%'
                      : nextPotluck.status === 'spinning' ? '60%'
                      : nextPotluck.status === 'active' ? '85%'
                      : '100%'
                  }}
                />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Active potlucks section */}
      {activePotlucks.length > 0 && (
        <section>
          <h2 className="text-lg font-extrabold text-gray-900 mb-3">
            Active Potlucks
          </h2>
          <div className="space-y-3">
            {activePotlucks.map((potluck) => (
              <PotluckCard
                key={potluck.id}
                id={potluck.id}
                name={potluck.name}
                cuisineTheme={potluck.cuisine_theme}
                cuisineEmoji={getEmoji(potluck.cuisine_theme)}
                eventDate={potluck.event_date || undefined}
                location={potluck.location || undefined}
                memberCount={potluck.potluck_members?.[0]?.count || 0}
                status={potluck.status}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past potlucks section */}
      {pastPotlucks.length > 0 && (
        <section>
          <h2 className="text-lg font-extrabold text-gray-900 mb-3">
            Past Potlucks
          </h2>
          <div className="space-y-3">
            {pastPotlucks.map((potluck) => (
              <PotluckCard
                key={potluck.id}
                id={potluck.id}
                name={potluck.name}
                cuisineTheme={potluck.cuisine_theme}
                cuisineEmoji={getEmoji(potluck.cuisine_theme)}
                eventDate={potluck.event_date || undefined}
                location={potluck.location || undefined}
                memberCount={potluck.potluck_members?.[0]?.count || 0}
                status={potluck.status}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state for logged-in users with no potlucks */}
      {!loading && user && potlucks.length === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-gray-700 font-bold text-base">No potlucks yet!</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Create one or join with an invite code.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/potluck/create" className="gradient-primary text-white font-bold text-sm py-2.5 px-5 rounded-xl">
              🎉 Create One
            </Link>
            <Link href="/potluck/join" className="border-2 border-orange-200 text-orange-500 font-bold text-sm py-2.5 px-5 rounded-xl">
              🎟️ Join One
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
