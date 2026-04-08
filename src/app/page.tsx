/**
 * Home Screen
 *
 * The main landing page of the app. Shows:
 * - A welcome banner with quick action buttons (Create / Join)
 * - Active potlucks the user is part of (from Supabase)
 * - Past potlucks history
 *
 * If the user isn't logged in, shows demo data and a login prompt.
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

      // Get all potlucks where the user is a member or the host
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

  return (
    <div className="space-y-6">
      {/* Welcome banner with gradient */}
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
            Get Started
          </Link>
        </div>
      )}

      {/* Loading state */}
      {loading && user && (
        <p className="text-center text-gray-400 text-sm py-8">Loading your potlucks...</p>
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

      {/* Empty state for logged in users with no potlucks */}
      {!loading && user && potlucks.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-gray-500 text-sm">
            No potlucks yet — create one or join with an invite code!
          </p>
        </div>
      )}
    </div>
  )
}
