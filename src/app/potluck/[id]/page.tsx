/**
 * Potluck Dashboard
 *
 * Redesigned around the 4 stages of a potluck:
 *   1. pending   → Gather guests, share invite
 *   2. spinning  → Everyone spins for their recipe
 *   3. active    → Rate dishes, share photos
 *   4. completed → See results and recap
 *
 * Each stage shows ONE clear primary action.
 * Everything else is secondary or hidden until relevant.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { formatInviteCode, formatDate, formatTime, CUISINE_THEMES } from '@/lib/utils'
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
  assigned_recipe_url: string | null
  profiles: { display_name: string; avatar_url: string | null }
    | { display_name: string; avatar_url: string | null }[]
}

// Resolve profiles whether Supabase returns it as object or array
function getDisplayName(profiles: Member['profiles']): string {
  if (!profiles) return 'Unknown'
  if (Array.isArray(profiles)) return profiles[0]?.display_name || 'Unknown'
  return (profiles as { display_name: string }).display_name || 'Unknown'
}

// Stage metadata — label + colour + step number shown to user
const STAGES = {
  pending:   { step: 1, total: 4, label: 'Gathering Guests',   color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  spinning:  { step: 2, total: 4, label: 'Spin Phase',         color: 'text-purple-600 bg-purple-50 border-purple-200' },
  active:    { step: 3, total: 4, label: 'Rating Dishes',      color: 'text-green-600  bg-green-50  border-green-200'  },
  completed: { step: 4, total: 4, label: 'Completed',          color: 'text-gray-500   bg-gray-50   border-gray-200'   },
}

export default function PotluckDashboard() {
  const params   = useParams()
  const router   = useRouter()
  const { user } = useAuth()
  const potluckId = params.id as string

  const [potluck,         setPotluck]         = useState<Potluck | null>(null)
  const [members,         setMembers]         = useState<Member[]>([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const [showInvite,      setShowInvite]      = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [copied,          setCopied]          = useState(false)
  const [actionLoading,   setActionLoading]   = useState(false)

  const cuisineInfo    = CUISINE_THEMES.find(c => c.name === potluck?.cuisine_theme)
  const isHost         = user?.id === potluck?.host_id
  const currentMember  = members.find(m => m.user_id === user?.id)
  const hasSpun        = !!currentMember?.assigned_recipe_name
  const stage          = STAGES[(potluck?.status as keyof typeof STAGES) ?? 'pending'] ?? STAGES.pending
  const spunCount      = members.filter(m => m.assigned_recipe_name).length
  const formattedCode  = potluck ? formatInviteCode(potluck.invite_code) : ''
  const deepLink       = potluck ? `https://potluck-jackpot.vercel.app/potluck/join?code=${formattedCode}` : ''

  useEffect(() => {
    async function fetchPotluck() {
      const { data: potluckData, error: potluckError } = await supabase
        .from('potlucks').select('*').eq('id', potluckId).single()

      if (potluckError || !potluckData) {
        setError('Potluck not found'); setLoading(false); return
      }
      setPotluck(potluckData)

      const { data: membersData } = await supabase
        .from('potluck_members')
        .select('*, profiles(display_name, avatar_url)')
        .eq('potluck_id', potluckId)

      if (membersData) setMembers(membersData as unknown as Member[])
      setLoading(false)
    }

    fetchPotluck()

    const channel = supabase
      .channel(`potluck-${potluckId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'potluck_members', filter: `potluck_id=eq.${potluckId}` },
        fetchPotluck)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [potluckId])

  // Copy invite code to clipboard
  function handleCopyCode() {
    navigator.clipboard?.writeText(formattedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Native share sheet (SMS, WhatsApp, iMessage, etc.)
  async function handleShare() {
    const text = `🎰 Join my potluck "${potluck?.name}"!\n\nCuisine: ${potluck?.cuisine_theme}\nTap to join 👉 ${deepLink}`
    if (navigator.share) {
      try { await navigator.share({ title: `Join my potluck!`, text, url: deepLink }) } catch { /* cancelled */ }
    } else {
      navigator.clipboard?.writeText(deepLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Host: move potluck to next stage
  async function advanceStage(newStatus: string) {
    setActionLoading(true)
    await supabase.from('potlucks').update({ status: newStatus }).eq('id', potluckId)
    setPotluck(prev => prev ? { ...prev, status: newStatus } : null)
    setActionLoading(false)
  }

  // Google Calendar link
  function calendarUrl() {
    if (!potluck?.event_date) return null
    const title    = encodeURIComponent(`🎰 ${potluck.name} — Potluck Jackpot`)
    const location = encodeURIComponent(potluck.location || '')
    const details  = encodeURIComponent(`Cuisine: ${potluck.cuisine_theme}\nhttps://potluck-jackpot.vercel.app/potluck/${potluck.id}`)
    const dateStr  = potluck.event_date.replace(/-/g, '')
    let dates = ''
    if (potluck.event_time) {
      const [hh, mm] = potluck.event_time.split(':')
      const endHH = String((parseInt(hh) + 3) % 24).padStart(2, '0')
      dates = `${dateStr}T${hh}${mm}00/${dateStr}T${endHH}${mm}00`
    } else {
      dates = `${dateStr}/${dateStr}`
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`
  }

  // ── Loading / error states ──────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading potluck...</p>
    </div>
  )

  if (error || !potluck) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-3">
      <div className="text-4xl">😕</div>
      <p className="text-gray-500">{error || 'Potluck not found'}</p>
      <button onClick={() => router.push('/')} className="text-orange-500 font-semibold text-sm">← Go Home</button>
    </div>
  )

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="gradient-primary rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{cuisineInfo?.emoji || '🍽️'}</span>
            <div>
              <h2 className="text-xl font-extrabold leading-tight">{potluck.name}</h2>
              <p className="text-sm opacity-80">{potluck.cuisine_theme} cuisine</p>
            </div>
          </div>
          {/* Stage badge */}
          <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full whitespace-nowrap">
            Step {stage.step}/{stage.total}
          </span>
        </div>

        {/* Event details */}
        {(potluck.event_date || potluck.location) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-80 mt-1">
            {potluck.event_date && <span>📅 {formatDate(potluck.event_date)}</span>}
            {potluck.event_time && <span>🕐 {formatTime(potluck.event_time)}</span>}
            {potluck.location   && <span>📍 {potluck.location}</span>}
          </div>
        )}

        {/* Step label + progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs opacity-70 mb-1">
            <span>{stage.label}</span>
            <span>{stage.step} of {stage.total}</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(stage.step / stage.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── STAGE 1: Pending — gather guests ── */}
      {potluck.status === 'pending' && (
        <>
          {/* Invite section */}
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <h3 className="text-base font-extrabold text-gray-900 mb-1">Invite your guests</h3>
            <p className="text-xs text-gray-400 mb-4">Share the code or link — friends tap to join</p>

            {/* Code display */}
            <div className="bg-gray-50 rounded-xl py-3 px-4 text-center mb-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Invite Code</p>
              <p className="text-3xl font-extrabold tracking-widest text-orange-500">{formattedCode}</p>
            </div>

            {/* Primary share action */}
            <button
              onClick={handleShare}
              className="w-full gradient-primary text-white font-bold py-3.5 rounded-xl text-sm mb-2"
            >
              📱 Share Invite Link
            </button>

            {/* Secondary options in one compact row */}
            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 py-2.5 rounded-xl"
              >
                {copied ? '✅ Copied!' : '📋 Copy Code'}
              </button>
              <button
                onClick={() => {
                  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deepLink)}`
                  window.open(fbUrl, '_blank', 'width=600,height=400,noopener,noreferrer')
                }}
                className="flex-1 text-sm font-semibold text-white bg-[#1877F2] py-2.5 rounded-xl"
              >
                📘 Facebook
              </button>
              <button
                onClick={() => setShowInvite(!showInvite)}
                className="flex-1 text-sm font-semibold text-purple-600 bg-purple-50 py-2.5 rounded-xl"
              >
                ✉️ Email
              </button>
            </div>

            {/* Email invite — expandable */}
            {showInvite && <EmailInviteForm potluck={potluck} formattedCode={formattedCode} deepLink={deepLink} cuisineInfo={cuisineInfo} />}
          </div>

          {/* Calendar add */}
          {calendarUrl() && (
            <a
              href={calendarUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 card-shadow text-sm font-semibold text-blue-500"
            >
              📅 Add to your calendar
              <span className="ml-auto text-gray-300">›</span>
            </a>
          )}

          {/* Host CTA: start spin phase */}
          {isHost && (
            <div className="bg-white rounded-2xl p-5 card-shadow">
              <p className="text-sm font-bold text-gray-900 mb-1">Ready to spin?</p>
              <p className="text-xs text-gray-400 mb-3">
                Once all your guests have joined, kick off the spin phase. Everyone will be assigned a random recipe.
              </p>
              <button
                onClick={() => advanceStage('spinning')}
                disabled={actionLoading || members.length < 2}
                className="w-full gradient-primary text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-40"
              >
                {actionLoading ? 'Starting…' : '🎰 Start Spin Phase'}
              </button>
              {members.length < 2 && (
                <p className="text-xs text-gray-400 text-center mt-2">Invite at least one more guest first</p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── STAGE 2: Spinning — everyone gets a recipe ── */}
      {potluck.status === 'spinning' && (
        <>
          {/* User's primary action */}
          {!hasSpun ? (
            <Link
              href={`/potluck/${potluckId}/spin`}
              className="block bg-white rounded-2xl p-5 card-shadow text-center"
            >
              <div className="text-5xl mb-2">🎰</div>
              <p className="text-lg font-extrabold text-gray-900 mb-1">Your turn to spin!</p>
              <p className="text-sm text-gray-400 mb-4">Tap to get your random recipe assignment</p>
              <div className="gradient-primary text-white font-bold py-3.5 rounded-xl text-sm">
                Spin the Wheel →
              </div>
            </Link>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-base font-extrabold text-green-800 mb-1">You&apos;re all set!</p>
              <p className="text-sm text-green-700">
                You&apos;re making <strong>{currentMember?.assigned_recipe_name}</strong>
              </p>
              {currentMember?.assigned_recipe_url && (
                <a
                  href={currentMember.assigned_recipe_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs font-semibold text-green-600 bg-green-100 px-3 py-1.5 rounded-full"
                >
                  View Recipe →
                </a>
              )}
            </div>
          )}

          {/* Spin progress */}
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold text-gray-900">Who&apos;s spun?</p>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                {spunCount}/{members.length} done
              </span>
            </div>
            <div className="space-y-2">
              {members.map(m => {
                const name = getDisplayName(m.profiles)
                const spun = !!m.assigned_recipe_name
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xs flex-shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <p className="flex-1 text-sm font-medium text-gray-800">
                      {name}
                      {m.user_id === potluck.host_id && <span className="text-orange-400 ml-1">👑</span>}
                    </p>
                    {spun
                      ? <span className="text-xs text-green-600 font-semibold">✅ Spun</span>
                      : <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
                    }
                  </div>
                )
              })}
            </div>
          </div>

          {/* Host: once everyone's done / potluck happened */}
          {isHost && (
            <div className="bg-white rounded-2xl p-4 card-shadow">
              <p className="text-sm font-bold text-gray-900 mb-1">Potluck night arrived?</p>
              <p className="text-xs text-gray-400 mb-3">Open ratings so guests can score each other&apos;s dishes.</p>
              <button
                onClick={() => advanceStage('active')}
                disabled={actionLoading}
                className="w-full bg-[#27AE60] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40"
              >
                {actionLoading ? 'Opening…' : '🎉 Potluck Happened — Open Ratings'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── STAGE 3: Active — rating dishes ── */}
      {potluck.status === 'active' && (
        <>
          <Link
            href={`/potluck/${potluckId}/rate`}
            className="block bg-white rounded-2xl p-5 card-shadow text-center"
          >
            <div className="text-5xl mb-2">⭐</div>
            <p className="text-lg font-extrabold text-gray-900 mb-1">Rate the dishes!</p>
            <p className="text-sm text-gray-400 mb-4">Score everyone&apos;s dish 1–5 stars</p>
            <div className="gradient-primary text-white font-bold py-3.5 rounded-xl text-sm">
              Rate Dishes →
            </div>
          </Link>

          {/* Photo share */}
          <button
            onClick={() => setShowPhotoUpload(!showPhotoUpload)}
            className="w-full bg-white rounded-xl px-4 py-3.5 card-shadow text-sm font-semibold text-teal-600 flex items-center gap-2"
          >
            <span className="text-xl">📸</span>
            <span>Share a photo from the night</span>
            <span className="ml-auto text-gray-300">›</span>
          </button>
          {showPhotoUpload && (
            <PhotoUpload potluckId={potluckId} onUploaded={() => setShowPhotoUpload(false)} onCancel={() => setShowPhotoUpload(false)} />
          )}

          {/* Host: close ratings */}
          {isHost && (
            <div className="bg-white rounded-2xl p-4 card-shadow">
              <p className="text-sm font-bold text-gray-900 mb-1">Everyone rated?</p>
              <p className="text-xs text-gray-400 mb-3">Close ratings to reveal the final scores.</p>
              <button
                onClick={() => advanceStage('completed')}
                disabled={actionLoading}
                className="w-full border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl text-sm disabled:opacity-40"
              >
                {actionLoading ? 'Closing…' : '🔒 Close Ratings & Reveal Results'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── STAGE 4: Completed ── */}
      {potluck.status === 'completed' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/potluck/${potluckId}/results`}
              className="bg-white rounded-2xl p-4 card-shadow text-center"
            >
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-sm font-extrabold text-gray-900">Results</p>
              <p className="text-xs text-gray-400">See the scores</p>
            </Link>
            <Link
              href={`/potluck/${potluckId}/recap`}
              className="gradient-primary rounded-2xl p-4 text-center text-white"
            >
              <div className="text-3xl mb-1">🎉</div>
              <p className="text-sm font-extrabold">Recap</p>
              <p className="text-xs opacity-80">Winner &amp; photos</p>
            </Link>
          </div>

          {/* Share recap */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const recapUrl = `https://potluck-jackpot.vercel.app/potluck/${potluckId}/recap`
                if (navigator.share) {
                  navigator.share({ title: `${potluck.name} Recap`, url: recapUrl })
                } else {
                  navigator.clipboard?.writeText(recapUrl)
                }
              }}
              className="flex-1 bg-[#4ECDC4] text-white font-bold py-3 rounded-xl text-sm"
            >
              📱 Share Recap
            </button>
            <button
              onClick={() => {
                const recapUrl = `https://potluck-jackpot.vercel.app/potluck/${potluckId}/recap`
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recapUrl)}`, '_blank', 'width=600,height=400')
              }}
              className="flex-1 bg-[#1877F2] text-white font-bold py-3 rounded-xl text-sm"
            >
              📘 Facebook
            </button>
          </div>

          {/* Photo share still available */}
          <button
            onClick={() => setShowPhotoUpload(!showPhotoUpload)}
            className="w-full bg-white rounded-xl px-4 py-3.5 card-shadow text-sm font-semibold text-teal-600 flex items-center gap-2"
          >
            <span className="text-xl">📸</span>
            <span>Share a photo</span>
            <span className="ml-auto text-gray-300">›</span>
          </button>
          {showPhotoUpload && (
            <PhotoUpload potluckId={potluckId} onUploaded={() => setShowPhotoUpload(false)} onCancel={() => setShowPhotoUpload(false)} />
          )}
        </>
      )}

      {/* ── Guest list — always visible, compact ── */}
      <div className="bg-white rounded-2xl p-4 card-shadow">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-extrabold text-gray-900">
            Guests <span className="text-gray-400 font-normal">({members.length})</span>
          </p>
          {/* During pending stage, quick invite shortcut */}
          {potluck.status === 'pending' && (
            <button onClick={handleShare} className="text-xs text-orange-500 font-semibold">
              + Invite
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-3">No guests yet</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => {
              const name = getDisplayName(m.profiles)
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {name}
                      {m.user_id === potluck.host_id && <span className="text-orange-400 ml-1">👑</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {m.assigned_recipe_name
                        ? `🍳 ${m.assigned_recipe_name}`
                        : m.rsvp_status === 'accepted' ? '✅ Joined'
                        : m.rsvp_status === 'declined' ? '❌ Declined'
                        : '⏳ Pending'}
                    </p>
                  </div>
                  {potluck.status === 'spinning' && (
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      m.assigned_recipe_name ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Email invite form (inlined, shown only during pending stage) ─────────────

function EmailInviteForm({
  potluck, formattedCode, deepLink, cuisineInfo
}: {
  potluck: Potluck
  formattedCode: string
  deepLink: string
  cuisineInfo: { emoji: string; name: string } | undefined
}) {
  const [email,       setEmail]       = useState('')
  const [friendName,  setFriendName]  = useState('')
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)
  const [err,         setErr]         = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true); setErr('')
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          friendName: friendName.trim() || undefined,
          potluckName: potluck.name,
          cuisineTheme: potluck.cuisine_theme,
          cuisineEmoji: cuisineInfo?.emoji || '🍽️',
          inviteCode: formattedCode,
          deepLink,
          eventDate: potluck.event_date ?? undefined,
          eventTime: potluck.event_time ?? undefined,
          location: potluck.location ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.mailtoUrl) window.open(data.mailtoUrl, '_blank')
      setSent(true); setEmail(''); setFriendName('')
      setTimeout(() => setSent(false), 3000)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to send')
    }
    setSending(false)
  }

  return (
    <form onSubmit={handleSend} className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      <input
        type="text"
        value={friendName}
        onChange={e => setFriendName(e.target.value)}
        placeholder="Friend's name (optional)"
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="friend@example.com"
        required
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      {err && <p className="text-red-500 text-xs">{err}</p>}
      {sent
        ? <p className="text-green-600 text-sm font-semibold text-center">✅ Email invite sent!</p>
        : (
          <button
            type="submit"
            disabled={sending || !email}
            className="w-full bg-[#A06CD5] text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-40"
          >
            {sending ? 'Opening email…' : 'Send Email Invite ✉️'}
          </button>
        )
      }
    </form>
  )
}
