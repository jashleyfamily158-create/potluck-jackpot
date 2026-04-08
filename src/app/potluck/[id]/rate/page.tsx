/**
 * Rating Page
 *
 * After the potluck, users rate each other's dishes 1-5 stars.
 * You can't rate your own dish. Ratings are saved to Supabase
 * and averaged to determine the winner.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import StarRating from '@/components/StarRating'

interface RateableMember {
  user_id: string
  display_name: string
  recipe_name: string
  myRating: number
}

export default function RatePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const potluckId = params.id as string

  const [members, setMembers] = useState<RateableMember[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadMembers() {
      // Get all members who have a recipe assigned (they participated)
      const { data: membersData } = await supabase
        .from('potluck_members')
        .select('user_id, assigned_recipe_name, profiles(display_name)')
        .eq('potluck_id', potluckId)
        .not('assigned_recipe_name', 'is', null)

      if (!membersData || !user) {
        setLoading(false)
        return
      }

      // Get any existing ratings by this user for this potluck
      const { data: existingRatings } = await supabase
        .from('ratings')
        .select('ratee_id, score')
        .eq('potluck_id', potluckId)
        .eq('rater_id', user.id)

      const ratingsMap = new Map(
        existingRatings?.map(r => [r.ratee_id, r.score]) || []
      )

      // Build the list, excluding the current user
      const rateable = (membersData as unknown as Array<{
        user_id: string
        assigned_recipe_name: string
        profiles: { display_name: string }
      }>)
        .filter(m => m.user_id !== user.id)
        .map(m => ({
          user_id: m.user_id,
          display_name: m.profiles?.display_name || 'Unknown',
          recipe_name: m.assigned_recipe_name,
          myRating: ratingsMap.get(m.user_id) || 0,
        }))

      setMembers(rateable)
      setSubmitted(existingRatings ? existingRatings.length > 0 : false)
      setLoading(false)
    }

    loadMembers()
  }, [potluckId, user])

  function updateRating(userId: string, score: number) {
    setMembers(prev =>
      prev.map(m => m.user_id === userId ? { ...m, myRating: score } : m)
    )
  }

  async function submitRatings() {
    if (!user) return
    setSubmitting(true)

    // Only submit ratings that have been set (> 0)
    const ratingsToSubmit = members
      .filter(m => m.myRating > 0)
      .map(m => ({
        potluck_id: potluckId,
        rater_id: user.id,
        ratee_id: m.user_id,
        score: m.myRating,
      }))

    if (ratingsToSubmit.length > 0) {
      // Upsert so we can re-submit if needed
      await supabase
        .from('ratings')
        .upsert(ratingsToSubmit, {
          onConflict: 'potluck_id,rater_id,ratee_id',
        })
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading dishes...</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-extrabold text-gray-900">Ratings Submitted!</h2>
        <p className="text-sm text-gray-500">Thanks for rating everyone&apos;s dishes</p>
        <button
          onClick={() => router.push(`/potluck/${potluckId}/results`)}
          className="gradient-primary text-white font-bold py-3 px-8 rounded-xl text-sm"
        >
          🏆 View Results
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">
          Rate the Dishes ⭐
        </h2>
        <p className="text-sm text-gray-500">
          How was everyone&apos;s cooking? Tap the stars to rate.
        </p>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.user_id} className="bg-white rounded-2xl p-4 card-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm">
                {member.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{member.display_name}</p>
                <p className="text-xs text-gray-400">🍳 {member.recipe_name}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <StarRating
                rating={member.myRating}
                onRate={(score) => updateRating(member.user_id, score)}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={submitRatings}
        disabled={submitting || members.every(m => m.myRating === 0)}
        className="w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40"
      >
        {submitting ? 'Submitting...' : 'Submit Ratings'}
      </button>
    </div>
  )
}
