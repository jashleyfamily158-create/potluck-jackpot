/**
 * Friends Page
 *
 * A working friends system:
 * - Search for other users by display name
 * - Send friend requests
 * - Accept or decline incoming requests
 * - See your friends list with their potluck stats
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
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

export default function FriendsPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchFriends() {
    if (!user) return

    const { data } = await supabase
      .from('friendships')
      .select('id, user_a, user_b, status')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)

    if (!data) { setLoading(false); return }

    // For each friendship, get the other person's profile
    const friendList: Friend[] = []
    for (const f of data) {
      const otherId = f.user_a === user.id ? f.user_b : f.user_a
      const direction = f.user_a === user.id ? 'sent' : 'received'

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', otherId)
        .single()

      // Count their potlucks
      const { count } = await supabase
        .from('potluck_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', otherId)

      friendList.push({
        id: f.id,
        user_id: otherId,
        display_name: profile?.display_name || 'Unknown',
        status: f.status,
        direction,
        potlucks_attended: count || 0,
      })
    }

    setFriends(friendList)
    setLoading(false)
  }

  useEffect(() => {
    fetchFriends()
  }, [user])

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

    // Check existing friendships
    const results: SearchResult[] = profiles.map(p => ({
      id: p.id,
      display_name: p.display_name,
      already_friends: friends.some(f => f.user_id === p.id && f.status === 'accepted'),
      request_pending: friends.some(f => f.user_id === p.id && f.status === 'pending'),
    }))

    setSearchResults(results)
    setSearching(false)
  }

  async function sendFriendRequest(toUserId: string) {
    if (!user) return
    await supabase.from('friendships').insert({
      user_a: user.id,
      user_b: toUserId,
      status: 'pending',
    })
    fetchFriends()
    setSearchResults(prev =>
      prev.map(r => r.id === toUserId ? { ...r, request_pending: true } : r)
    )
  }

  async function respondToRequest(friendshipId: string, accept: boolean) {
    if (accept) {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    } else {
      await supabase.from('friendships').delete().eq('id', friendshipId)
    }
    fetchFriends()
  }

  const acceptedFriends = friends.filter(f => f.status === 'accepted')
  const pendingReceived = friends.filter(f => f.status === 'pending' && f.direction === 'received')
  const pendingSent = friends.filter(f => f.status === 'pending' && f.direction === 'sent')

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4">👥</div>
        <p className="text-gray-500 text-sm mb-4">Sign in to connect with friends</p>
        <Link href="/login" className="gradient-primary text-white font-bold text-sm py-3 px-6 rounded-xl">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-extrabold text-gray-900">Friends 👥</h2>

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search by name..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="gradient-primary text-white font-bold px-4 py-3 rounded-xl text-sm"
        >
          {searching ? '...' : '🔍'}
        </button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Search Results</p>
          {searchResults.map(result => (
            <div key={result.id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 font-bold">
                {result.display_name.charAt(0).toUpperCase()}
              </div>
              <p className="flex-1 font-semibold text-gray-900 text-sm">{result.display_name}</p>
              {result.already_friends ? (
                <span className="text-xs text-green-500 font-semibold">✅ Friends</span>
              ) : result.request_pending ? (
                <span className="text-xs text-gray-400 font-semibold">⏳ Pending</span>
              ) : (
                <button
                  onClick={() => sendFriendRequest(result.id)}
                  className="bg-[#A06CD5] text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  + Add
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Incoming friend requests */}
      {pendingReceived.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Friend Requests ({pendingReceived.length})
          </p>
          {pendingReceived.map(f => (
            <div key={f.id} className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                {f.display_name.charAt(0).toUpperCase()}
              </div>
              <p className="flex-1 font-semibold text-gray-900 text-sm">{f.display_name}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => respondToRequest(f.id, true)}
                  className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => respondToRequest(f.id, false)}
                  className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends list */}
      {loading && <p className="text-center text-gray-400 text-sm py-4">Loading friends...</p>}

      {!loading && acceptedFriends.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            My Friends ({acceptedFriends.length})
          </p>
          {acceptedFriends.map(f => (
            <div key={f.id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-500 font-bold">
                {f.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{f.display_name}</p>
                <p className="text-xs text-gray-400">{f.potlucks_attended} potluck{f.potlucks_attended !== 1 ? 's' : ''} attended</p>
              </div>
              <span className="text-green-400 text-lg">✅</span>
            </div>
          ))}
        </div>
      )}

      {/* Sent requests */}
      {pendingSent.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Sent Requests</p>
          {pendingSent.map(f => (
            <div key={f.id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                {f.display_name.charAt(0).toUpperCase()}
              </div>
              <p className="flex-1 font-semibold text-gray-700 text-sm">{f.display_name}</p>
              <span className="text-xs text-gray-400">⏳ Pending</span>
            </div>
          ))}
        </div>
      )}

      {!loading && friends.length === 0 && searchResults.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-gray-500 text-sm">Search for friends by name above!</p>
        </div>
      )}
    </div>
  )
}
