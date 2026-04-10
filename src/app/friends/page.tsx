/**
 * Friends Page
 *
 * - Search for users by display name
 * - Send / accept / decline friend requests
 * - Friends list with an "Invite to Potluck" button on each friend
 *   → tapping it shows a sheet of your active potlucks to pick from
 *   → then triggers the native share sheet (or copies the link)
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { formatInviteCode, CUISINE_THEMES } from '@/lib/utils'
import Link from 'next/link'

interface Friend {
  id: string
  user_id: string
  display_name: string
  status: 'pending' | 'accepted'
  direction: 'sent' | 'received'
  potlucks_attended?: number
}

interface SearchResult {
  id: string
  display_name: string
  already_friends: boolean
  request_pending: boolean
}

interface ActivePotluck {
  id: string
  name: string
  cuisine_theme: string
  invite_code: string
}

// ── Invite-to-potluck bottom sheet ────────────────────────────────────────────

function InviteSheet({
  friend,
  potlucks,
  onClose,
}: {
  friend: Friend
  potlucks: ActivePotluck[]
  onClose: () => void
}) {
  const [shared, setShared] = useState<string | null>(null)

  function getEmoji(theme: string) {
    return CUISINE_THEMES.find(c => c.name === theme)?.emoji || '🍽️'
  }

  async function inviteTo(p: ActivePotluck) {
    const code     = formatInviteCode(p.invite_code)
    const deepLink = `https://potluck-jackpot.vercel.app/potluck/join?code=${code}`
    const text     = `🎰 Hey ${friend.display_name}! Join my potluck "${p.name}" on Potluck Jackpot — ${p.cuisine_theme} cuisine!\n\nTap to join 👉 ${deepLink}`

    if (navigator.share) {
      try { await navigator.share({ title: `Join ${p.name}!`, text, url: deepLink }) } catch { /* cancelled */ }
    } else {
      navigator.clipboard?.writeText(deepLink)
    }
    setShared(p.id)
    setTimeout(onClose, 1500)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white rounded-t-2xl z-50">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="p-5">
          <p className="text-base font-extrabold text-gray-900 mb-0.5">
            Invite {friend.display_name}
          </p>
          <p className="text-xs text-gray-400 mb-4">Pick a potluck to share</p>

          {potlucks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-3">No active potlucks yet.</p>
              <Link href="/potluck/create" onClick={onClose}
                className="inline-block gradient-primary text-white font-bold text-sm py-2.5 px-5 rounded-xl">
                🎉 Create One
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {potlucks.map(p => (
                <button
                  key={p.id}
                  onClick={() => inviteTo(p)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-colors ${
                    shared === p.id ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-orange-50'
                  }`}
                >
                  <span className="text-2xl">{getEmoji(p.cuisine_theme)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.cuisine_theme} · {formatInviteCode(p.invite_code)}</p>
                  </div>
                  {shared === p.id
                    ? <span className="text-green-500 font-bold text-xs">✅ Sent!</span>
                    : <span className="text-gray-300 text-lg">›</span>
                  }
                </button>
              ))}
            </div>
          )}

          <button onClick={onClose} className="w-full text-gray-400 text-sm font-semibold py-3 mt-2">
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const { user } = useAuth()

  const [friends,       setFriends]       = useState<Friend[]>([])
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching,     setSearching]     = useState(false)
  const [loading,       setLoading]       = useState(true)

  // Invite sheet state
  const [invitingFriend,  setInvitingFriend]  = useState<Friend | null>(null)
  const [myPotlucks,      setMyPotlucks]      = useState<ActivePotluck[]>([])
  const [loadingPotlucks, setLoadingPotlucks] = useState(false)

  async function fetchFriends() {
    if (!user) return

    const { data } = await supabase
      .from('friendships')
      .select('id, user_a, user_b, status')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)

    if (!data) { setLoading(false); return }

    const list: Friend[] = []
    for (const f of data) {
      const otherId   = f.user_a === user.id ? f.user_b : f.user_a
      const direction = f.user_a === user.id ? 'sent' : 'received'

      const { data: profile } = await supabase
        .from('profiles').select('display_name').eq('id', otherId).single()

      const { count } = await supabase
        .from('potluck_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', otherId)

      list.push({
        id: f.id,
        user_id: otherId,
        display_name: profile?.display_name || 'Unknown',
        status: f.status,
        direction,
        potlucks_attended: count || 0,
      })
    }

    setFriends(list)
    setLoading(false)
  }

  useEffect(() => { fetchFriends() }, [user])

  // Load user's active potlucks when they tap Invite on a friend
  async function openInviteSheet(friend: Friend) {
    setInvitingFriend(friend)
    if (!user) return
    setLoadingPotlucks(true)

    // Get potlucks where user is host and status is pending/spinning
    const { data } = await supabase
      .from('potlucks')
      .select('id, name, cuisine_theme, invite_code')
      .eq('host_id', user.id)
      .in('status', ['pending', 'spinning'])
      .order('created_at', { ascending: false })

    setMyPotlucks((data as ActivePotluck[]) || [])
    setLoadingPotlucks(false)
  }

  async function handleSearch() {
    if (!searchQuery.trim() || !user) return
    setSearching(true)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('display_name', `%${searchQuery.trim()}%`)
      .neq('id', user.id)
      .limit(10)

    if (!profiles) { setSearching(false); return }

    const results: SearchResult[] = profiles.map(p => ({
      id: p.id,
      display_name: p.display_name,
      already_friends: friends.some(f => f.user_id === p.id && f.status === 'accepted'),
      request_pending: friends.some(f => f.user_id === p.id && f.status === 'pending'),
    }))

    setSearchResults(results)
    setSearching(false)
  }

  async function sendRequest(toUserId: string) {
    if (!user) return
    await supabase.from('friendships').insert({ user_a: user.id, user_b: toUserId, status: 'pending' })
    fetchFriends()
    setSearchResults(prev => prev.map(r => r.id === toUserId ? { ...r, request_pending: true } : r))
  }

  async function respond(friendshipId: string, accept: boolean) {
    if (accept) {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    } else {
      await supabase.from('friendships').delete().eq('id', friendshipId)
    }
    fetchFriends()
  }

  const acceptedFriends  = friends.filter(f => f.status === 'accepted')
  const pendingReceived  = friends.filter(f => f.status === 'pending' && f.direction === 'received')
  const pendingSent      = friends.filter(f => f.status === 'pending' && f.direction === 'sent')

  // Avatar colour based on name
  const COLORS = [
    'bg-orange-100 text-orange-500',
    'bg-purple-100 text-purple-500',
    'bg-teal-100 text-teal-500',
    'bg-pink-100 text-pink-500',
    'bg-blue-100 text-blue-500',
  ]
  function avatarColor(name: string) {
    return COLORS[name.charCodeAt(0) % COLORS.length]
  }

  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="text-5xl mb-4">👥</div>
      <p className="text-gray-500 text-sm mb-4">Sign in to connect with friends</p>
      <Link href="/login" className="gradient-primary text-white font-bold text-sm py-3 px-6 rounded-xl">Sign In</Link>
    </div>
  )

  return (
    <>
      <div className="space-y-5">
        <h2 className="text-xl font-extrabold text-gray-900">Friends 👥</h2>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name…"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button onClick={handleSearch} disabled={searching}
            className="gradient-primary text-white font-bold px-4 py-3 rounded-xl text-sm">
            {searching ? '…' : '🔍'}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Search Results</p>
            {searchResults.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${avatarColor(r.display_name)}`}>
                  {r.display_name.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 font-semibold text-gray-900 text-sm">{r.display_name}</p>
                {r.already_friends
                  ? <span className="text-xs text-green-500 font-bold">✅ Friends</span>
                  : r.request_pending
                  ? <span className="text-xs text-gray-400 font-semibold">⏳ Pending</span>
                  : (
                    <button onClick={() => sendRequest(r.id)}
                      className="bg-[#A06CD5] text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                      + Add
                    </button>
                  )
                }
              </div>
            ))}
          </div>
        )}

        {/* Incoming friend requests */}
        {pendingReceived.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Requests ({pendingReceived.length})
            </p>
            {pendingReceived.map(f => (
              <div key={f.id} className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${avatarColor(f.display_name)}`}>
                  {f.display_name.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 font-semibold text-gray-900 text-sm">{f.display_name}</p>
                <div className="flex gap-2">
                  <button onClick={() => respond(f.id, true)}
                    className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    ✓ Accept
                  </button>
                  <button onClick={() => respond(f.id, false)}
                    className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Friends list */}
        {loading && <p className="text-center text-gray-400 text-sm py-4">Loading…</p>}

        {!loading && acceptedFriends.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              My Friends ({acceptedFriends.length})
            </p>
            {acceptedFriends.map(f => (
              <div key={f.id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${avatarColor(f.display_name)}`}>
                  {f.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{f.display_name}</p>
                  <p className="text-xs text-gray-400">
                    {f.potlucks_attended} potluck{f.potlucks_attended !== 1 ? 's' : ''}
                  </p>
                </div>
                {/* Invite to potluck button */}
                <button
                  onClick={() => openInviteSheet(f)}
                  className="flex items-center gap-1.5 bg-orange-50 text-orange-500 text-xs font-bold px-3 py-2 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  🎰 Invite
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sent requests */}
        {pendingSent.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sent Requests</p>
            {pendingSent.map(f => (
              <div key={f.id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3 opacity-60">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${avatarColor(f.display_name)}`}>
                  {f.display_name.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 font-semibold text-gray-700 text-sm">{f.display_name}</p>
                <span className="text-xs text-gray-400">⏳ Pending</span>
              </div>
            ))}
          </div>
        )}

        {!loading && friends.length === 0 && searchResults.length === 0 && (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-gray-700 font-bold">No friends yet</p>
            <p className="text-gray-400 text-sm mt-1">Search for people by name above to get started!</p>
          </div>
        )}
      </div>

      {/* Invite sheet — renders outside the scroll flow */}
      {invitingFriend && (
        <InviteSheet
          friend={invitingFriend}
          potlucks={loadingPotlucks ? [] : myPotlucks}
          onClose={() => { setInvitingFriend(null); setMyPotlucks([]) }}
        />
      )}
    </>
  )
}
