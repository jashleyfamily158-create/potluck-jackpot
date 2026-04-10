/**
 * Potluck Dashboard — v4
 *
 * Stages: pending → spinning → active → completed (or cancelled)
 *
 * Host-only manage menu (⚙️ in header):
 *   - Reschedule (edit date/time/location inline)
 *   - Cancel potluck (sets status = cancelled)
 *   - Delete potluck (hard delete, redirects home)
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { formatInviteCode, formatDate, formatTime, CUISINE_THEMES } from '@/lib/utils'
import PhotoUpload from '@/components/PhotoUpload'

// ── Types ─────────────────────────────────────────────────────────────────────

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
  profiles: { display_name: string } | { display_name: string }[]
}

function getName(p: Member['profiles']): string {
  if (!p) return 'Unknown'
  if (Array.isArray(p)) return p[0]?.display_name || 'Unknown'
  return (p as { display_name: string }).display_name || 'Unknown'
}

// ── Step dots indicator ───────────────────────────────────────────────────────

const STAGE_ORDER = ['pending', 'spinning', 'active', 'completed']

function StepDots({ status }: { status: string }) {
  const cur = STAGE_ORDER.indexOf(status)
  if (cur === -1) return null
  return (
    <div className="flex items-center gap-1.5">
      {STAGE_ORDER.map((_, i) => (
        <div key={i} className={`rounded-full transition-all ${
          i < cur  ? 'w-2 h-2 bg-white opacity-50' :
          i === cur ? 'w-3 h-2 bg-white' :
          'w-2 h-2 bg-white opacity-20'
        }`} />
      ))}
    </div>
  )
}

// ── Calendar URL ──────────────────────────────────────────────────────────────

function buildCalendarUrl(p: Potluck): string | null {
  if (!p.event_date) return null
  const title   = encodeURIComponent(`🎰 ${p.name} — Potluck Jackpot`)
  const loc     = encodeURIComponent(p.location || '')
  const details = encodeURIComponent(`Cuisine: ${p.cuisine_theme}\nhttps://potluck-jackpot.vercel.app/potluck/${p.id}`)
  const d       = p.event_date.replace(/-/g, '')
  let dates = `${d}/${d}`
  if (p.event_time) {
    const [hh, mm] = p.event_time.split(':')
    const endHH = String((parseInt(hh) + 3) % 24).padStart(2, '0')
    dates = `${d}T${hh}${mm}00/${d}T${endHH}${mm}00`
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${loc}`
}

// ── Manage menu (host only) ───────────────────────────────────────────────────

type ManageView = 'menu' | 'reschedule' | 'confirmCancel' | 'confirmDelete'

function ManageMenu({
  potluck,
  onClose,
  onUpdated,
  onDeleted,
}: {
  potluck: Potluck
  onClose: () => void
  onUpdated: (updated: Partial<Potluck>) => void
  onDeleted: () => void
}) {
  const [view,    setView]    = useState<ManageView>('menu')
  const [date,    setDate]    = useState(potluck.event_date || '')
  const [time,    setTime]    = useState(potluck.event_time || '')
  const [loc,     setLoc]     = useState(potluck.location || '')
  const [busy,    setBusy]    = useState(false)

  async function reschedule() {
    setBusy(true)
    await supabase.from('potlucks').update({
      event_date: date || null,
      event_time: time || null,
      location:   loc  || null,
    }).eq('id', potluck.id)
    onUpdated({ event_date: date || null, event_time: time || null, location: loc || null })
    setBusy(false)
    onClose()
  }

  async function cancelPotluck() {
    setBusy(true)
    await supabase.from('potlucks').update({ status: 'cancelled' }).eq('id', potluck.id)
    onUpdated({ status: 'cancelled' })
    setBusy(false)
    onClose()
  }

  async function deletePotluck() {
    setBusy(true)
    await supabase.from('potlucks').delete().eq('id', potluck.id)
    onDeleted()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white rounded-t-2xl z-50 overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {view === 'menu' && (
          <div className="p-5 space-y-2">
            <p className="text-base font-extrabold text-gray-900 mb-3">Manage Potluck</p>

            <button
              onClick={() => setView('reschedule')}
              className="w-full flex items-center gap-3 bg-blue-50 text-blue-700 font-semibold text-sm px-4 py-3.5 rounded-xl text-left"
            >
              <span className="text-xl">📅</span>
              <div>
                <p className="font-bold">Reschedule</p>
                <p className="text-xs text-blue-400 font-normal">Change date, time or location</p>
              </div>
              <span className="ml-auto text-blue-300">›</span>
            </button>

            {potluck.status !== 'cancelled' && potluck.status !== 'completed' && (
              <button
                onClick={() => setView('confirmCancel')}
                className="w-full flex items-center gap-3 bg-yellow-50 text-yellow-700 font-semibold text-sm px-4 py-3.5 rounded-xl text-left"
              >
                <span className="text-xl">⏸️</span>
                <div>
                  <p className="font-bold">Cancel Potluck</p>
                  <p className="text-xs text-yellow-500 font-normal">Guests will be notified</p>
                </div>
                <span className="ml-auto text-yellow-300">›</span>
              </button>
            )}

            <button
              onClick={() => setView('confirmDelete')}
              className="w-full flex items-center gap-3 bg-red-50 text-red-600 font-semibold text-sm px-4 py-3.5 rounded-xl text-left"
            >
              <span className="text-xl">🗑️</span>
              <div>
                <p className="font-bold">Delete Potluck</p>
                <p className="text-xs text-red-400 font-normal">Permanently removes all data</p>
              </div>
              <span className="ml-auto text-red-300">›</span>
            </button>

            <button onClick={onClose} className="w-full text-gray-400 text-sm font-semibold py-3">
              Cancel
            </button>
          </div>
        )}

        {view === 'reschedule' && (
          <div className="p-5 space-y-3">
            <button onClick={() => setView('menu')} className="text-sm text-gray-400 font-semibold">← Back</button>
            <p className="text-base font-extrabold text-gray-900">Reschedule</p>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Location</label>
              <input type="text" value={loc} onChange={e => setLoc(e.target.value)}
                placeholder="e.g. 123 Main St or Sarah's place"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>

            <button onClick={reschedule} disabled={busy}
              className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-40 mt-2">
              {busy ? 'Saving…' : '📅 Save Changes'}
            </button>
            <button onClick={onClose} className="w-full text-gray-400 text-sm font-semibold py-2">Cancel</button>
          </div>
        )}

        {view === 'confirmCancel' && (
          <div className="p-5 text-center space-y-4">
            <div className="text-4xl">⏸️</div>
            <p className="text-base font-extrabold text-gray-900">Cancel this potluck?</p>
            <p className="text-sm text-gray-400">The potluck will be marked as cancelled. You can still view it but no new spins or ratings will be allowed.</p>
            <button onClick={cancelPotluck} disabled={busy}
              className="w-full bg-yellow-500 text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-40">
              {busy ? 'Cancelling…' : 'Yes, Cancel It'}
            </button>
            <button onClick={() => setView('menu')} className="w-full text-gray-400 text-sm font-semibold py-2">Go Back</button>
          </div>
        )}

        {view === 'confirmDelete' && (
          <div className="p-5 text-center space-y-4">
            <div className="text-4xl">🗑️</div>
            <p className="text-base font-extrabold text-gray-900">Delete this potluck?</p>
            <p className="text-sm text-gray-400">This permanently deletes <strong>{potluck.name}</strong> and all its data — members, ratings, and photos. This cannot be undone.</p>
            <button onClick={deletePotluck} disabled={busy}
              className="w-full bg-red-500 text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-40">
              {busy ? 'Deleting…' : 'Yes, Delete Forever'}
            </button>
            <button onClick={() => setView('menu')} className="w-full text-gray-400 text-sm font-semibold py-2">Go Back</button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Email invite form ─────────────────────────────────────────────────────────

function EmailForm({ potluck, formattedCode, deepLink, cuisineInfo }: {
  potluck: Potluck
  formattedCode: string
  deepLink: string
  cuisineInfo: { emoji: string } | undefined
}) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [err,     setErr]     = useState('')

  async function send(e: React.FormEvent) {
    e.preventDefault(); setSending(true); setErr('')
    try {
      const res  = await fetch('/api/invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email, friendName: name || undefined,
          potluckName: potluck.name, cuisineTheme: potluck.cuisine_theme,
          cuisineEmoji: cuisineInfo?.emoji || '🍽️',
          inviteCode: formattedCode, deepLink,
          eventDate: potluck.event_date ?? undefined,
          eventTime: potluck.event_time ?? undefined,
          location:  potluck.location  ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.mailtoUrl) window.open(data.mailtoUrl, '_blank')
      setSent(true); setName(''); setEmail('')
      setTimeout(() => setSent(false), 3000)
    } catch (ex) { setErr(ex instanceof Error ? ex.message : 'Failed') }
    setSending(false)
  }

  return (
    <form onSubmit={send} className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
      <input type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Friend's name (optional)"
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="friend@example.com" required
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
      {err && <p className="text-red-500 text-xs">{err}</p>}
      {sent
        ? <p className="text-green-600 text-sm font-bold text-center">✅ Invite sent!</p>
        : <button type="submit" disabled={sending || !email}
            className="w-full bg-[#A06CD5] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40">
            {sending ? 'Sending…' : 'Send Email Invite ✉️'}
          </button>
      }
    </form>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function PotluckDashboard() {
  const params    = useParams()
  const router    = useRouter()
  const { user }  = useAuth()
  const potluckId = params.id as string

  const [potluck,         setPotluck]         = useState<Potluck | null>(null)
  const [members,         setMembers]         = useState<Member[]>([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const [showManage,      setShowManage]      = useState(false)
  const [showEmailForm,   setShowEmailForm]   = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [copied,          setCopied]          = useState(false)
  const [advancing,       setAdvancing]       = useState(false)

  const cuisineInfo   = CUISINE_THEMES.find(c => c.name === potluck?.cuisine_theme)
  const isHost        = user?.id === potluck?.host_id
  const me            = members.find(m => m.user_id === user?.id)
  const hasSpun       = !!me?.assigned_recipe_name
  const spunCount     = members.filter(m => m.assigned_recipe_name).length
  const formattedCode = potluck ? formatInviteCode(potluck.invite_code) : ''
  const deepLink      = `https://potluck-jackpot.vercel.app/potluck/join?code=${formattedCode}`

  useEffect(() => {
    async function load() {
      const { data, error: e } = await supabase.from('potlucks').select('*').eq('id', potluckId).single()
      if (e || !data) { setError('Potluck not found'); setLoading(false); return }
      setPotluck(data)

      const { data: mData } = await supabase
        .from('potluck_members')
        .select('*, profiles(display_name)')
        .eq('potluck_id', potluckId)
      if (mData) setMembers(mData as unknown as Member[])
      setLoading(false)
    }
    load()

    const ch = supabase.channel(`potluck-${potluckId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'potluck_members', filter: `potluck_id=eq.${potluckId}` },
        load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [potluckId])

  async function advance(status: string) {
    setAdvancing(true)
    await supabase.from('potlucks').update({ status }).eq('id', potluckId)
    setPotluck(p => p ? { ...p, status } : null)
    setAdvancing(false)
  }

  async function share() {
    const text = `🎰 Join "${potluck?.name}" on Potluck Jackpot!\nCuisine: ${potluck?.cuisine_theme}\n👉 ${deepLink}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Join my potluck!', text, url: deepLink }) } catch { /**/ }
    } else {
      navigator.clipboard?.writeText(deepLink)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(formattedCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading / error ────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-400 text-sm animate-pulse">Loading…</p>
    </div>
  )

  if (error || !potluck) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
      <span className="text-4xl">😕</span>
      <p className="text-gray-500 text-sm">{error || 'Potluck not found'}</p>
      <button onClick={() => router.push('/')} className="text-orange-500 font-bold text-sm">← Home</button>
    </div>
  )

  const calUrl = buildCalendarUrl(potluck)
  const status = potluck.status

  // Header colour per stage
  const headerColor =
    status === 'spinning'  ? 'bg-[#A06CD5]' :
    status === 'active'    ? 'bg-[#27AE60]' :
    status === 'completed' ? 'bg-gray-500'  :
    status === 'cancelled' ? 'bg-gray-400'  :
    'bg-[#FF8E53]'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-3">

        {/* ── Identity strip ─────────────────────────────────────────────────── */}
        <div className={`rounded-2xl px-4 py-3.5 flex items-center gap-3 ${headerColor}`}>
          <span className="text-2xl">{cuisineInfo?.emoji || '🍽️'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-base leading-tight truncate">{potluck.name}</p>
            <p className="text-white/70 text-xs">{potluck.cuisine_theme} cuisine</p>
          </div>
          <div className="flex items-center gap-2">
            <StepDots status={status} />
            {/* Host-only manage button */}
            {isHost && (
              <button
                onClick={() => setShowManage(true)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-base hover:bg-white/30 transition-colors ml-1"
                title="Manage potluck"
              >
                ⚙️
              </button>
            )}
          </div>
        </div>

        {/* Event meta */}
        {(potluck.event_date || potluck.location) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
            {potluck.event_date && <span className="text-xs text-gray-500">📅 {formatDate(potluck.event_date)}</span>}
            {potluck.event_time && <span className="text-xs text-gray-500">🕐 {formatTime(potluck.event_time)}</span>}
            {potluck.location   && <span className="text-xs text-gray-500">📍 {potluck.location}</span>}
            {calUrl && (
              <a href={calUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-400 font-semibold ml-auto">
                + Calendar
              </a>
            )}
          </div>
        )}

        {/* ── CANCELLED state ─────────────────────────────────────────────── */}
        {status === 'cancelled' && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">⏸️</div>
            <p className="font-extrabold text-gray-700 text-lg mb-1">Potluck Cancelled</p>
            <p className="text-sm text-gray-400 mb-4">This potluck has been cancelled by the host.</p>
            {isHost && (
              <button
                onClick={() => advance('pending')}
                disabled={advancing}
                className="text-sm font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-xl"
              >
                Reactivate Potluck
              </button>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STAGE 1 — PENDING
        ════════════════════════════════════════════════════════════════════ */}
        {status === 'pending' && (
          <>
            <div className="bg-white rounded-2xl overflow-hidden card-shadow">
              <div className="h-1 bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#FFC93C]" />
              <div className="p-5">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Step 1 of 4</p>
                <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">Invite your crew 🎉</h2>
                <p className="text-sm text-gray-400 mb-4">Share the link — friends tap it and they&apos;re in.</p>

                <div className="bg-orange-50 rounded-xl py-3 text-center mb-4">
                  <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-0.5">Invite Code</p>
                  <p className="text-3xl font-extrabold tracking-[0.18em] text-orange-500">{formattedCode}</p>
                </div>

                <button onClick={share}
                  className="w-full gradient-primary text-white font-extrabold py-4 rounded-xl text-sm mb-3 shadow-sm">
                  📱 Share Invite Link
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={copyCode}
                    className="py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold">
                    {copied ? '✅ Done' : '📋 Copy'}
                  </button>
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deepLink)}`, '_blank', 'width=600,height=400,noopener,noreferrer')}
                    className="py-2.5 rounded-xl bg-[#1877F2] text-white text-xs font-bold">
                    📘 Facebook
                  </button>
                  <button onClick={() => setShowEmailForm(!showEmailForm)}
                    className="py-2.5 rounded-xl bg-purple-50 text-purple-600 text-xs font-bold">
                    ✉️ Email
                  </button>
                </div>
                {showEmailForm && <EmailForm potluck={potluck} formattedCode={formattedCode} deepLink={deepLink} cuisineInfo={cuisineInfo} />}
              </div>
            </div>

            {isHost && (
              <div className="bg-white rounded-2xl p-5 card-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">🎰</div>
                  <div className="flex-1">
                    <p className="font-extrabold text-gray-900 text-sm mb-0.5">Ready to spin?</p>
                    <p className="text-xs text-gray-400 mb-3">Once everyone&apos;s joined, kick off the spin phase.</p>
                    <button onClick={() => advance('spinning')} disabled={advancing || members.length < 2}
                      className="w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40">
                      {advancing ? 'Starting…' : '🎰 Start Spin Phase'}
                    </button>
                    {members.length < 2 && <p className="text-xs text-gray-400 text-center mt-2">Need at least 2 guests to start</p>}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STAGE 2 — SPINNING
        ════════════════════════════════════════════════════════════════════ */}
        {status === 'spinning' && (
          <>
            {!hasSpun ? (
              <Link href={`/potluck/${potluckId}/spin`} className="block rounded-2xl overflow-hidden card-shadow">
                <div className="bg-gradient-to-br from-[#A06CD5] to-[#7C4DFF] p-6 text-center text-white">
                  <div className="text-6xl mb-3">🎰</div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Step 2 of 4</p>
                  <h2 className="text-2xl font-extrabold mb-1">Spin your wheel!</h2>
                  <p className="text-sm opacity-80 mb-5">Tap below to get your random {potluck.cuisine_theme} recipe.</p>
                  <div className="bg-white text-purple-600 font-extrabold py-3.5 rounded-xl text-sm">Spin Now →</div>
                </div>
              </Link>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden card-shadow">
                <div className="h-1 bg-[#27AE60]" />
                <div className="p-5">
                  <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">Your assignment</p>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-1">✅ You&apos;re making:</h2>
                  <p className="text-lg font-bold text-green-700 mb-3">{me?.assigned_recipe_name}</p>
                  {me?.assigned_recipe_url && (
                    <a href={me.assigned_recipe_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-green-500 px-4 py-2 rounded-xl">
                      View Recipe →
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 card-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-extrabold text-gray-900">Who&apos;s spun?</p>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">{spunCount} / {members.length}</span>
              </div>
              <div className="space-y-2.5">
                {members.map(m => {
                  const name = getName(m.profiles)
                  const done = !!m.assigned_recipe_name
                  return (
                    <div key={m.id} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-extrabold text-xs flex-shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <p className="flex-1 text-sm font-semibold text-gray-800 truncate">
                        {name}{m.user_id === potluck.host_id && <span className="text-orange-400 ml-1 text-xs">👑</span>}
                      </p>
                      {done
                        ? <span className="text-xs font-bold text-green-500">✅ Done</span>
                        : <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {isHost && (
              <div className="bg-white rounded-2xl p-4 card-shadow border border-gray-100">
                <p className="text-sm font-extrabold text-gray-900 mb-0.5">Potluck night happened?</p>
                <p className="text-xs text-gray-400 mb-3">Open ratings so guests can score each other&apos;s dishes.</p>
                <button onClick={() => advance('active')} disabled={advancing}
                  className="w-full bg-[#27AE60] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40">
                  {advancing ? 'Opening…' : '🎉 Open Ratings'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STAGE 3 — ACTIVE
        ════════════════════════════════════════════════════════════════════ */}
        {status === 'active' && (
          <>
            <Link href={`/potluck/${potluckId}/rate`} className="block rounded-2xl overflow-hidden card-shadow">
              <div className="bg-gradient-to-br from-[#27AE60] to-[#1ABC9C] p-6 text-center text-white">
                <div className="text-6xl mb-3">⭐</div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Step 3 of 4</p>
                <h2 className="text-2xl font-extrabold mb-1">Rate the dishes!</h2>
                <p className="text-sm opacity-80 mb-5">Give every dish a score from 1 to 5 stars.</p>
                <div className="bg-white text-green-600 font-extrabold py-3.5 rounded-xl text-sm">Rate Dishes →</div>
              </div>
            </Link>

            <button onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              className="w-full bg-white rounded-xl px-4 py-3.5 card-shadow flex items-center gap-3 text-left">
              <span className="text-2xl">📸</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Share a photo</p>
                <p className="text-xs text-gray-400">Post a pic from the night to the feed</p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </button>
            {showPhotoUpload && <PhotoUpload potluckId={potluckId} onUploaded={() => setShowPhotoUpload(false)} onCancel={() => setShowPhotoUpload(false)} />}

            {isHost && (
              <div className="bg-white rounded-2xl p-4 card-shadow border border-gray-100">
                <p className="text-sm font-extrabold text-gray-900 mb-0.5">Everyone rated?</p>
                <p className="text-xs text-gray-400 mb-3">Close ratings to lock in scores and reveal the winner.</p>
                <button onClick={() => advance('completed')} disabled={advancing}
                  className="w-full border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl text-sm disabled:opacity-40">
                  {advancing ? 'Closing…' : '🔒 Close Ratings & Reveal Results'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STAGE 4 — COMPLETED
        ════════════════════════════════════════════════════════════════════ */}
        {status === 'completed' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/potluck/${potluckId}/results`}
                className="bg-white rounded-2xl p-5 card-shadow text-center flex flex-col items-center gap-2">
                <span className="text-4xl">🏆</span>
                <p className="font-extrabold text-gray-900 text-sm">Results</p>
                <p className="text-xs text-gray-400">Final scores</p>
              </Link>
              <Link href={`/potluck/${potluckId}/recap`}
                className="rounded-2xl p-5 text-center flex flex-col items-center gap-2 gradient-primary text-white">
                <span className="text-4xl">🎉</span>
                <p className="font-extrabold text-sm">Recap</p>
                <p className="text-xs opacity-80">Winner + photos</p>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => {
                const url = `https://potluck-jackpot.vercel.app/potluck/${potluckId}/recap`
                if (navigator.share) navigator.share({ title: `${potluck.name} Recap`, url })
                else navigator.clipboard?.writeText(url)
              }} className="bg-[#4ECDC4] text-white font-bold py-3 rounded-xl text-sm">
                📱 Share Recap
              </button>
              <button onClick={() => {
                const url = `https://potluck-jackpot.vercel.app/potluck/${potluckId}/recap`
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400')
              }} className="bg-[#1877F2] text-white font-bold py-3 rounded-xl text-sm">
                📘 Facebook
              </button>
            </div>

            <button onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              className="w-full bg-white rounded-xl px-4 py-3.5 card-shadow flex items-center gap-3 text-left">
              <span className="text-2xl">📸</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Share a photo</p>
                <p className="text-xs text-gray-400">Add to the potluck feed</p>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </button>
            {showPhotoUpload && <PhotoUpload potluckId={potluckId} onUploaded={() => setShowPhotoUpload(false)} onCancel={() => setShowPhotoUpload(false)} />}
          </>
        )}

        {/* ── Guest list ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold text-gray-900">
              Guests <span className="text-gray-400 font-normal">({members.length})</span>
            </p>
            {status === 'pending' && (
              <button onClick={share} className="text-xs font-bold text-orange-500">+ Invite</button>
            )}
          </div>
          {members.length === 0
            ? <p className="text-center text-gray-400 text-sm py-2">No guests yet — share the invite!</p>
            : (
              <div className="space-y-2.5">
                {members.map(m => {
                  const name   = getName(m.profiles)
                  const colors = ['bg-orange-100 text-orange-500','bg-purple-100 text-purple-500','bg-teal-100 text-teal-500','bg-pink-100 text-pink-500']
                  const color  = colors[name.charCodeAt(0) % colors.length]
                  return (
                    <div key={m.id} className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${color}`}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {name}{m.user_id === potluck.host_id && <span className="text-orange-400 text-xs ml-1">👑</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {m.assigned_recipe_name ? `🍳 ${m.assigned_recipe_name}`
                            : m.rsvp_status === 'declined' ? '❌ Declined' : '⏳ Joined'}
                        </p>
                      </div>
                      {status === 'spinning' && (
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.assigned_recipe_name ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* ── Manage bottom sheet (rendered outside main flow to overlay correctly) ── */}
      {showManage && potluck && (
        <ManageMenu
          potluck={potluck}
          onClose={() => setShowManage(false)}
          onUpdated={(updates) => {
            setPotluck(p => p ? { ...p, ...updates } : null)
            setShowManage(false)
          }}
          onDeleted={() => router.push('/')}
        />
      )}
    </>
  )
}
