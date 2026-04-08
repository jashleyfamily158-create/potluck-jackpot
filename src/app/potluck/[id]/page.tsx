/**
 * Potluck Dashboard Page
 *
 * The main hub for a specific potluck. Shows:
 * - Potluck name, cuisine theme, date/time/location
 * - Invite code for sharing
 * - List of members with their RSVP and spin status
 * - Action buttons (start spin phase, go to spin, rate dishes)
 *
 * Fetches real data from Supabase based on the potluck ID in the URL.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { formatInviteCode, formatDate, formatTime, CUISINE_THEMES } from '@/lib/utils'
import InviteFriends from '@/components/InviteFriends'
import PhotoUpload from '@/components/PhotoUpload'

interface Potluck {
  id: string
  name: string
  invite_code: string
  cuisine_theme: string
  host_id: string
  event_date: string | null
  event_time: string | null
  location: string | null
  status: string
}

interface Member {
  id: string
  user_id: string
  rsvp_status: string
  assigned_recipe_name: string | null
  profiles: {
    display_name: string
    avatar_url: string | null
  }
}

export default function PotluckDashboard() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const potluckId = params.id as string

  const [potluck, setPotluck] = useState<Potluck | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)

  // Find the cuisine emoji for the theme
  const cuisineInfo = CUISINE_THEMES.find(c => c.name === potluck?.cuisine_theme)

  // Is the current user the host?
  const isHost = user?.id === potluck?.host_id

  // Has the current user already spun?
  const currentMember = members.find(m => m.user_id === user?.id)
  const hasSpun = !!currentMember?.assigned_recipe_name

  useEffect(() => {
    async function fetchPotluck() {
      // Fetch the potluck details
      const { data: potluckData, error: potluckError } = await supabase
        .from('potlucks')
        .select('*')
        .eq('id', potluckId)
        .single()

      if (potluckError || !potluckData) {
        setError('Potluck not found')
        setLoading(false)
        return
      }

      setPotluck(potluckData)

      // Fetch all members with their profile info
      const { data: membersData } = await supabase
        .from('potluck_members')
        .select('*, profiles(display_name, avatar_url)')
        .eq('potluck_id', potluckId)

      if (membersData) {
        setMembers(membersData as unknown as Member[])
      }

      setLoading(false)
    }

    fetchPotluck()

    // Set up real-time subscription for member updates
    const channel = supabase
      .channel(`potluck-${potluckId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'potluck_members', filter: `potluck_id=eq.${potluckId}` },
        () => {
          // Re-fetch members when anything changes
          fetchPotluck()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [potluckId])

  // Host starts the spin phase
  async function startSpinPhase() {
    await supabase
      .from('potlucks')
      .update({ status: 'spinning' })
      .eq('id', potluckId)

    setPotluck(prev => prev ? { ...prev, status: 'spinning' } : null)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading potluck...</div>
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

  return (
    <div className="space-y-5">
      {/* Potluck header card */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-4xl">{cuisineInfo?.emoji || '🍽️'}</span>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-gray-900">{potluck.name}</h2>
            <p className="text-sm text-gray-500">{potluck.cuisine_theme} cuisine</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            potluck.status === 'spinning' ? 'bg-purple-100 text-purple-700' :
            potluck.status === 'active' ? 'bg-green-100 text-green-700' :
            potluck.status === 'completed' ? 'bg-gray-100 text-gray-600' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {potluck.status}
          </span>
        </div>

        {/* Event details */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {potluck.event_date && (
            <span>📅 {formatDate(potluck.event_date)}</span>
          )}
          {potluck.event_time && (
            <span>🕐 {formatTime(potluck.event_time)}</span>
          )}
          {potluck.location && (
            <span>📍 {potluck.location}</span>
          )}
        </div>
      </div>

      {/* Invite friends section — code, email, and share */}
      <InviteFriends
        potluckName={potluck.name}
        cuisineTheme={potluck.cuisine_theme}
        cuisineEmoji={cuisineInfo?.emoji || '🍽️'}
        inviteCode={potluck.invite_code}
        formattedCode={formatInviteCode(potluck.invite_code)}
        eventDate={potluck.event_date ? formatDate(potluck.event_date) : undefined}
        eventTime={potluck.event_time ? formatTime(potluck.event_time) : undefined}
        location={potluck.location || undefined}
      />

      {/* Action buttons based on potluck status */}
      <div className="space-y-2">
        {potluck.status === 'pending' && isHost && (
          <button
            onClick={startSpinPhase}
            className="w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm"
          >
            🎰 Start Spin Phase
          </button>
        )}

        {potluck.status === 'spinning' && !hasSpun && (
          <Link
            href={`/potluck/${potluckId}/spin`}
            className="block w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm text-center"
          >
            🎰 Spin the Wheel!
          </Link>
        )}

        {potluck.status === 'spinning' && hasSpun && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-semibold text-sm">
              ✅ You&apos;ve spun! Your recipe: {currentMember?.assigned_recipe_name}
            </p>
          </div>
        )}

        {potluck.status === 'active' && (
          <Link
            href={`/potluck/${potluckId}/rate`}
            className="block w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm text-center"
          >
            ⭐ Rate Dishes
          </Link>
        )}

        {potluck.status === 'completed' && (
          <Link
            href={`/potluck/${potluckId}/results`}
            className="block w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm text-center"
          >
            🏆 View Results
          </Link>
        )}

        {/* Share a photo — always visible for members */}
        {currentMember && (
          <button
            onClick={() => setShowPhotoUpload(!showPhotoUpload)}
            className="w-full bg-[#4ECDC4] text-white font-bold py-3 rounded-xl text-sm"
          >
            📸 Share a Photo
          </button>
        )}

        {/* Photo upload form */}
        {showPhotoUpload && (
          <PhotoUpload
            potluckId={potluckId}
            onUploaded={() => setShowPhotoUpload(false)}
            onCancel={() => setShowPhotoUpload(false)}
          />
        )}
      </div>

      {/* Members list */}
      <div>
        <h3 className="text-base font-extrabold text-gray-900 mb-3">
          Guests ({members.length})
        </h3>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm">
                {member.profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {member.profiles?.display_name || 'Unknown'}
                  {member.user_id === potluck.host_id && (
                    <span className="text-orange-400 ml-1">👑</span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {member.assigned_recipe_name
                    ? `🍳 ${member.assigned_recipe_name}`
                    : member.rsvp_status === 'accepted'
                    ? '✅ Accepted — waiting to spin'
                    : member.rsvp_status === 'declined'
                    ? '❌ Declined'
                    : '⏳ Pending RSVP'}
                </p>
              </div>

              {/* Spin status indicator */}
              {potluck.status === 'spinning' && (
                <div className={`w-3 h-3 rounded-full ${
                  member.assigned_recipe_name ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
                }`} />
              )}
            </div>
          ))}

          {members.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">
              No guests yet — share your invite code!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
