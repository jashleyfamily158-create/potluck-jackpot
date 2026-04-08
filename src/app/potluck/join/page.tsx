/**
 * Join Potluck Page
 *
 * Lets users enter an invite code (PJ-XXXXXX) to join an existing potluck.
 * Parses the code, looks it up in Supabase, and adds the user as a member.
 *
 * Also supports deep links: if someone taps a link like
 * /potluck/join?code=PJ-XXXXXX, the code is auto-filled and the form
 * can be submitted immediately.
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { parseInviteCode } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-fill the code if it came in via a deep link (?code=PJ-XXXXXX)
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      setCode(codeFromUrl.toUpperCase())
    }
  }, [searchParams])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const parsed = parseInviteCode(code)

    if (parsed.length !== 6) {
      setError('Please enter a valid 6-character code')
      setLoading(false)
      return
    }

    try {
      // Look up the potluck by invite code
      const { data: potluck, error: lookupError } = await supabase
        .from('potlucks')
        .select('id, name, cuisine_theme')
        .eq('invite_code', parsed)
        .single()

      if (lookupError || !potluck) {
        setError('No potluck found with that code. Double-check and try again!')
        setLoading(false)
        return
      }

      // Add the current user as a member
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('potluck_members').insert({
          potluck_id: potluck.id,
          user_id: user.id,
          rsvp_status: 'pending',
        })
      }

      // Navigate to the potluck dashboard
      router.push(`/potluck/${potluck.id}`)
    } catch {
      setError('Could not connect to the server. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[60vh] flex flex-col justify-center space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🎟️</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
          Join a Potluck
        </h2>
        <p className="text-sm text-gray-500">
          Enter the invite code your friend shared with you
        </p>
      </div>

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Invite Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="PJ-XXXXXX"
            maxLength={10}
            className="w-full px-4 py-4 rounded-xl border border-gray-200 text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40 transition-opacity"
        >
          {loading ? 'Looking up...' : 'Join Potluck 🎉'}
        </button>
      </form>
    </div>
  )
}

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function JoinPotluckPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    }>
      <JoinForm />
    </Suspense>
  )
}
