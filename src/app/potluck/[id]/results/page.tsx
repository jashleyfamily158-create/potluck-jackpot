/**
 * Results Page
 *
 * Shows the final leaderboard for a potluck after everyone has rated.
 * Displays the winner with a trophy, and all dishes ranked by
 * average rating.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface RankedMember {
  user_id: string
  display_name: string
  recipe_name: string
  avg_rating: number
  rating_count: number
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const potluckId = params.id as string

  const [rankings, setRankings] = useState<RankedMember[]>([])
  const [potluckName, setPotluckName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResults() {
      // Get potluck name
      const { data: potluck } = await supabase
        .from('potlucks')
        .select('name')
        .eq('id', potluckId)
        .single()

      if (potluck) setPotluckName(potluck.name)

      // Get all members with recipes
      const { data: members } = await supabase
        .from('potluck_members')
        .select('user_id, assigned_recipe_name, profiles(display_name)')
        .eq('potluck_id', potluckId)
        .not('assigned_recipe_name', 'is', null)

      // Get all ratings for this potluck
      const { data: ratings } = await supabase
        .from('ratings')
        .select('ratee_id, score')
        .eq('potluck_id', potluckId)

      if (!members) {
        setLoading(false)
        return
      }

      // Calculate average rating for each member
      const ratingsByUser = new Map<string, number[]>()
      ratings?.forEach(r => {
        const existing = ratingsByUser.get(r.ratee_id) || []
        existing.push(r.score)
        ratingsByUser.set(r.ratee_id, existing)
      })

      const ranked = (members as unknown as Array<{
        user_id: string
        assigned_recipe_name: string
        profiles: { display_name: string }
      }>).map(m => {
        const userRatings = ratingsByUser.get(m.user_id) || []
        const avg = userRatings.length > 0
          ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length
          : 0

        return {
          user_id: m.user_id,
          display_name: m.profiles?.display_name || 'Unknown',
          recipe_name: m.assigned_recipe_name,
          avg_rating: Math.round(avg * 10) / 10,
          rating_count: userRatings.length,
        }
      })

      // Sort by average rating (highest first)
      ranked.sort((a, b) => b.avg_rating - a.avg_rating)
      setRankings(ranked)
      setLoading(false)
    }

    loadResults()
  }, [potluckId])

  const medals = ['🥇', '🥈', '🥉']

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading results...</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h2 className="text-xl font-extrabold text-gray-900">
          {potluckName} Results
        </h2>
      </div>

      {/* Winner spotlight */}
      {rankings.length > 0 && rankings[0].avg_rating > 0 && (
        <div className="gradient-primary rounded-2xl p-5 text-center text-white">
          <p className="text-xs uppercase tracking-wider opacity-80 font-semibold mb-1">Winner</p>
          <p className="text-3xl mb-1">👑</p>
          <h3 className="text-xl font-extrabold">{rankings[0].display_name}</h3>
          <p className="text-sm opacity-90">{rankings[0].recipe_name}</p>
          <p className="text-2xl font-extrabold mt-2">
            {rankings[0].avg_rating} ⭐
          </p>
        </div>
      )}

      {/* Full rankings */}
      <div className="space-y-2">
        {rankings.map((member, index) => (
          <div key={member.user_id} className="bg-white rounded-xl p-4 card-shadow flex items-center gap-3">
            <span className="text-2xl w-8 text-center">
              {index < 3 ? medals[index] : `${index + 1}.`}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {member.display_name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                🍳 {member.recipe_name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-gray-900">
                {member.avg_rating > 0 ? `${member.avg_rating} ⭐` : '—'}
              </p>
              <p className="text-xs text-gray-400">
                {member.rating_count} {member.rating_count === 1 ? 'vote' : 'votes'}
              </p>
            </div>
          </div>
        ))}

        {rankings.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">
            No results yet — nobody has been rated.
          </p>
        )}
      </div>

      <button
        onClick={() => router.push(`/potluck/${potluckId}`)}
        className="w-full border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm"
      >
        ← Back to Potluck
      </button>
    </div>
  )
}
