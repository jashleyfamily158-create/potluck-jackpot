/**
 * Signup Page
 *
 * Creates a new account with email/password via Supabase Auth,
 * then creates a profile record in the profiles table.
 *
 * Handles the case where Supabase has email confirmation enabled
 * (default) — shows a message to check email, or if confirmation
 * is disabled, goes straight to home.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Step 1: Create the auth account
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Check if email confirmation is required
    // If the user has an identities array with length 0, email isn't confirmed
    // If session is null but user exists, confirmation is needed
    if (data.user && !data.session) {
      // Email confirmation is required
      setNeedsConfirmation(true)
      setLoading(false)
      return
    }

    // Step 2: Create a profile record in our profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          display_name: displayName,
        })

      if (profileError) {
        // Profile creation failed — but auth account exists.
        // This is okay; we can create the profile later.
        console.warn('Profile creation failed:', profileError.message)
      }
    }

    // Go to home screen
    router.push('/')
    setLoading(false)
  }

  // Show confirmation message if email verification is needed
  if (needsConfirmation) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center text-center space-y-4">
        <div className="text-5xl">📧</div>
        <h2 className="text-xl font-extrabold text-gray-900">
          Check Your Email!
        </h2>
        <p className="text-sm text-gray-500 max-w-[300px] mx-auto">
          We sent a confirmation link to <strong>{email}</strong>. Click the link in the email, then come back and sign in.
        </p>
        <p className="text-xs text-gray-400 max-w-[280px] mx-auto">
          Tip: If you don&apos;t want to deal with email confirmation right now, go to your Supabase dashboard → Authentication → Providers → Email, and turn off &quot;Confirm email&quot;.
        </p>
        <Link
          href="/login"
          className="inline-block gradient-primary text-white font-bold text-sm py-3 px-8 rounded-xl"
        >
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex flex-col justify-center">
      {/* App logo / title */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Join the Party!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create your Potluck Jackpot account
        </p>
      </div>

      {/* Signup form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-1">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should we call you?"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Link to login */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-orange-500 font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  )
}
