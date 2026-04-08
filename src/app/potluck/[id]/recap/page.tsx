/**
 * Potluck Recap Page
 *
 * After a potluck is completed, this page shows a fun summary:
 * - The winner (highest-rated dish) with a trophy
 * - Full leaderboard with each person's dish and rating
 * - Photos shared during the event
 *
 * Great for screenshotting and sharing on social media!
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate, CUISINE_THEMES } from '@/lib/utils'

interface Potluck {
  id: string
  name: string
  cuisine_theme: string
  event_date: string | null
  location: string | null
  status: string
}

interface MemberResult {
  user_id: string
  display_name: string
  assigned_recipe_name: string | null
  dish_rating: number | null
}

interface FeedPhoto {
  id: string
  image_url: string
  caption: string | null
  profiles: { display_name: string } | { display_name: string }[]
}

// Render star rating as filled/empty circles for compactness
function StarDisplay({ score }: { score: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(Math.round(score))}{'☆'.repeat(5 - Math.round(score))}
    </span>
  )
}

export default function RecapPage() {
  const params = useParams()
  const router = useRouter()
  const potluckId = params.id as string

  const [potluck, setPotluck] = useState<Potluck | null>(null)
  const [results, setResults] = useState<MemberResult[]>([])
  const [photos, setPhotos] = useState<FeedPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cuisineInfo = CUISINE_THEMES.find(c => c.name === potluck?.cuisine_theme)

  useEffect(() => {
    async function fetchRecap() {
      // Load potluck info
      const { data: potluckData, error: pErr } = await supabase
        .from('potlucks')
        .select('id, name, cuisine_theme, event_date, location, status')
        .eq('id', potluckId)
        .single()

      if (pErr || !potluckData) {
        setError('Potluck not found')
        setLoading(false)
        return
      }

      setPotluck(potluckData)

      // Load members with their assigned recipes and ratings
      const { data: membersData } = await supabase
        .from('potluck_members')
        .select('user_id, assigned_recipe_name, dish_rating, profiles(display_name)')
        .eq('potluck_id', potluckId)

      if (membersData) {
        // Sort by dish_rating descending (nulls last)
        const sorted = (membersData as unknown as Array<{
          user_id: string
          assigned_recipe_name: string | null
          dish_rating: number | null
          profiles: { display_name: string } | { display_name: string }[]
        }>)
          .map(m => ({
            user_id: m.user_id,
            display_name: Array.isArray(m.profiles)
              ? m.profiles[0]?.display_name || 'Unknown'
              : (m.profiles as { display_name: string } | null)?.display_name || 'Unknown',
            assigned_recipe_name: m.assigned_recipe_name,
            dish_rating: m.dish_rating,
          }))
          .sort((a, b) => {
            if (a.dish_rating == null) return 1
            if (b.dish_rating == null) return -1
            return b.dish_rating - a.dish_rating
          })

        setResults(sorted)
      }

      // Load photos shared during this potluck
      const { data: photosData } = await supabase
        .from('feed_posts')
        .select('id, image_url, caption, profiles(display_name)')
        .eq('potluck_id', potluckId)
        .order('created_at', { ascending: true })

      if (photosData) {
        setPhotos(photosData as unknown as FeedPhoto[])
      }

      setLoading(false)
    }

    fetchRecap()
  }, [potluckId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading recap...</p>
      </div>
    )
  }

  if (error || !potluck) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3">😕</div>
        <p className="text-gray-500">{error || 'Potluck not found'}</p>
        <button onClick={() => router.push('/')} className="mt-4 text-orange-500 font-semibold text-sm">
          Go Home
        </button>
      </div>
    )
  }

  const winner = results[0]
  const hasRatings = results.some(r => r.dish_rating != null)

  return (
    <div className="space-y-6 pb-8">
      {/* Back link */}
      <Link href={`/potluck/${potluckId}`} className="text-sm text-orange-500 font-semibold flex items-center gap-1">
        ← Back to Potluck
      </Link>

      {/* Header banner */}
      <div className="gradient-primary rounded-2xl p-5 text-white text-center">
        <div className="text-5xl mb-2">{cuisineInfo?.emoji || '🍽️'}</div>
        <h2 className="text-2xl font-extrabold">{potluck.name}</h2>
        <p className="text-sm opacity-80 mt-1">
          {potluck.event_date ? formatDate(potluck.event_date) : 'Potluck Recap'}
          {potluck.location ? ` · ${potluck.location}` : ''}
        </p>
        <div className="mt-2 text-xs font-semibold bg-white/20 inline-block px-3 py-1 rounded-full">
          ✅ Completed
        </div>
      </div>

      {/* Winner spotlight */}
      {winner && hasRatings && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-1">🏆</div>
          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-1">Winner</p>
          <p className="text-xl font-extrabold text-gray-900">{winner.display_name}</p>
          {winner.assigned_recipe_name && (
            <p className="text-sm text-gray-600 mt-1">🍳 {winner.assigned_recipe_name}</p>
          )}
          {winner.dish_rating != null && (
            <div className="flex justify-center mt-2">
              <StarDisplay score={winner.dish_rating} />
              <span className="text-sm text-gray-500 ml-2">
                {winner.dish_rating.toFixed(1)} / 5.0
              </span>
            </div>
          )}
        </div>
      )}

      {/* Full leaderboard */}
      <div>
        <h3 className="text-base font-extrabold text-gray-900 mb-3">
          🍽️ Full Results
        </h3>
        <div className="space-y-2">
          {results.map((member, index) => {
            const medals = ['🥇', '🥈', '🥉']
            const medal = index < 3 ? medals[index] : `#${index + 1}`
            return (
              <div key={member.user_id} className={`bg-white rounded-xl p-3 card-shadow flex items-center gap-3 ${
                index === 0 && hasRatings ? 'ring-2 ring-yellow-300' : ''
              }`}>
                <div className="text-xl w-8 text-center">{medal}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{member.display_name}</p>
                  {member.assigned_recipe_name && (
                    <p className="text-xs text-gray-500 truncate">🍳 {member.assigned_recipe_name}</p>
                  )}
                </div>
                <div className="text-right">
                  {member.dish_rating != null ? (
                    <>
                      <StarDisplay score={member.dish_rating} />
                      <p className="text-xs text-gray-400 mt-0.5">{member.dish_rating.toFixed(1)}</p>
                    </>
                  ) : (
                    <span className="text-xs text-gray-300">No rating</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Photos from the event */}
      {photos.length > 0 && (
        <div>
          <h3 className="text-base font-extrabold text-gray-900 mb-3">
            📸 Photos from the Night
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo) => {
              const posterName = Array.isArray(photo.profiles)
                ? photo.profiles[0]?.display_name
                : (photo.profiles as { display_name: string } | null)?.display_name
              return (
                <div key={photo.id} className="rounded-xl overflow-hidden bg-white card-shadow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image_url}
                    alt={photo.caption || 'Potluck photo'}
                    className="w-full aspect-square object-cover"
                  />
                  {(photo.caption || posterName) && (
                    <div className="p-2">
                      {posterName && (
                        <p className="text-xs font-semibold text-gray-700">{posterName}</p>
                      )}
                      {photo.caption && (
                        <p className="text-xs text-gray-500 truncate">{photo.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Share the recap */}
      <div className="bg-white rounded-2xl p-5 card-shadow text-center space-y-3">
        <p className="text-sm font-semibold text-gray-700">Share the recap with your guests!</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const text = `🎰 Potluck Jackpot Recap: "${potluck.name}"\n\n🏆 Winner: ${winner?.display_name || 'TBD'}\n\nCheck out who cooked what 👉 https://potluck-jackpot.vercel.app/potluck/${potluckId}/recap`
              if (navigator.share) {
                navigator.share({ title: `${potluck.name} Recap`, text })
              } else {
                navigator.clipboard?.writeText(text)
              }
            }}
            className="flex-1 bg-[#4ECDC4] text-white font-bold py-3 rounded-xl text-sm"
          >
            📱 Share Recap
          </button>
          <button
            onClick={() => {
              const recapUrl = `https://potluck-jackpot.vercel.app/potluck/${potluckId}/recap`
              const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recapUrl)}`
              window.open(fbUrl, '_blank', 'width=600,height=400,noopener,noreferrer')
            }}
            className="flex-1 bg-[#1877F2] text-white font-bold py-3 rounded-xl text-sm"
          >
            📘 Facebook
          </button>
        </div>
      </div>
    </div>
  )
}
