/**
 * Rankings Page
 *
 * All-time leaderboard across every potluck in the app.
 * Shows each player's stats: potlucks attended, wins (1st place finishes),
 * and average dish rating. Top 3 get gold/silver/bronze treatment.
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PlayerStats {
  user_id: string
  display_name: string
  potlucks_attended: number
  wins: number
  avg_rating: number
  total_ratings: number
}

export default function RankingsPage() {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'rating' | 'wins' | 'attendance'>('rating')

  useEffect(() => {
    async function fetchRankings() {
      // Get all completed potlucks
      const { data: completedPotlucks } = await supabase
        .from('potlucks')
        .select('id')
        .eq('status', 'completed')

      const potluckIds = completedPotlucks?.map(p => p.id) || []

      if (potluckIds.length === 0) {
        setLoading(false)
        return
      }

      // Get all members from completed potlucks
      const { data: members } = await supabase
        .from('potluck_members')
        .select('user_id, potluck_id, dish_rating, profiles(display_name)')
        .in('potluck_id', potluckIds)
        .not('assigned_recipe_name', 'is', null)

      // Get all ratings
      const { data: ratings } = await supabase
        .from('ratings')
        .select('ratee_id, score')
        .in('potluck_id', potluckIds)

      // Get winners (highest rated person per potluck)
      const { data: results } = await supabase
        .from('potluck_members')
        .select('user_id, potluck_id, profiles(display_name)')
        .in('potluck_id', potluckIds)
        .not('assigned_recipe_name', 'is', null)

      if (!members) { setLoading(false); return }

      // Build a map of ratings per user
      const ratingsByUser = new Map<string, number[]>()
      ratings?.forEach(r => {
        const arr = ratingsByUser.get(r.ratee_id) || []
        arr.push(r.score)
        ratingsByUser.set(r.ratee_id, arr)
      })

      // Find winner of each potluck (highest avg rating among members)
      const winsByUser = new Map<string, number>()
      potluckIds.forEach(pid => {
        const potluckMembers = results?.filter(m => m.potluck_id === pid) || []
        let bestUser = ''
        let bestAvg = -1
        potluckMembers.forEach(m => {
          const userRatings = ratingsByUser.get(m.user_id) || []
          const avg = userRatings.length > 0
            ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length
            : 0
          if (avg > bestAvg) { bestAvg = avg; bestUser = m.user_id }
        })
        if (bestUser && bestAvg > 0) {
          winsByUser.set(bestUser, (winsByUser.get(bestUser) || 0) + 1)
        }
      })

      // Aggregate per-user stats
      // Note: Supabase returns joined tables as arrays, so we cast to unknown first
      const statsMap = new Map<string, PlayerStats>()
      members.forEach((m: {
        user_id: string
        profiles: { display_name: string }[] | { display_name: string } | null
      }) => {
        const existing = statsMap.get(m.user_id)
        const userRatings = ratingsByUser.get(m.user_id) || []
        const avg = userRatings.length > 0
          ? Math.round((userRatings.reduce((a, b) => a + b, 0) / userRatings.length) * 10) / 10
          : 0

        if (!existing) {
          // profiles may come back as an array or object depending on Supabase version
        const profileName = Array.isArray(m.profiles)
          ? m.profiles[0]?.display_name
          : (m.profiles as { display_name: string } | null)?.display_name
        statsMap.set(m.user_id, {
            user_id: m.user_id,
            display_name: profileName || 'Unknown',
            potlucks_attended: 1,
            wins: winsByUser.get(m.user_id) || 0,
            avg_rating: avg,
            total_ratings: userRatings.length,
          })
        } else {
          existing.potlucks_attended += 1
        }
      })

      setPlayers(Array.from(statsMap.values()))
      setLoading(false)
    }

    fetchRankings()
  }, [])

  // Sort based on active tab
  const sorted = [...players].sort((a, b) => {
    if (tab === 'rating') return b.avg_rating - a.avg_rating
    if (tab === 'wins') return b.wins - a.wins
    return b.potlucks_attended - a.potlucks_attended
  })

  const medals = ['🥇', '🥈', '🥉']
  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32']

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-extrabold text-gray-900">All-Time Rankings 🏆</h2>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {[
          { key: 'rating', label: '⭐ Rating' },
          { key: 'wins', label: '🥇 Wins' },
          { key: 'attendance', label: '🍽️ Potlucks' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-center text-gray-400 text-sm py-8">Loading rankings...</p>
      )}

      {!loading && players.length === 0 && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-gray-500 text-sm max-w-[260px]">
            No rankings yet! Complete a potluck with ratings to see the leaderboard.
          </p>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && sorted.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {[sorted[1], sorted[0], sorted[2]].map((player, i) => {
            const rank = i === 1 ? 0 : i === 0 ? 1 : 2
            const heights = ['h-24', 'h-32', 'h-20']
            return (
              <div key={player.user_id} className="flex flex-col items-center gap-1">
                <span className="text-xl">{medals[rank]}</span>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm">
                  {player.display_name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-bold text-gray-700 text-center w-16 truncate">
                  {player.display_name}
                </p>
                <div
                  className={`w-16 ${heights[rank]} rounded-t-xl flex items-center justify-center`}
                  style={{ backgroundColor: podiumColors[rank] + '33', border: `2px solid ${podiumColors[rank]}` }}
                >
                  <p className="text-xs font-extrabold" style={{ color: podiumColors[rank] }}>
                    {tab === 'rating' ? `${player.avg_rating}⭐` :
                     tab === 'wins' ? `${player.wins}W` :
                     `${player.potlucks_attended}`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="space-y-2">
        {sorted.map((player, index) => (
          <div key={player.user_id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3">
            <span className="text-xl w-8 text-center font-bold text-gray-400">
              {index < 3 ? medals[index] : `${index + 1}`}
            </span>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
              {player.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{player.display_name}</p>
              <p className="text-xs text-gray-400">
                {player.potlucks_attended} potluck{player.potlucks_attended !== 1 ? 's' : ''} · {player.wins} win{player.wins !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-gray-900 text-sm">
                {tab === 'rating'
                  ? player.avg_rating > 0 ? `${player.avg_rating} ⭐` : '—'
                  : tab === 'wins'
                  ? `${player.wins} 🥇`
                  : `${player.potlucks_attended} 🍽️`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
