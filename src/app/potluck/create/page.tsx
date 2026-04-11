/**
 * Create Potluck Page
 *
 * Multi-step form to create a new potluck:
 * 1. Pick a cuisine theme
 * 2. (Optional) Pick an event/vibe theme — browse or slot machine
 * 3. Set name, date, time, location
 * 4. Get your invite code to share
 *
 * Requires the user to be logged in. If not, redirects to signup.
 * After creating, the host is automatically added as a member.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CuisineGrid from '@/components/CuisineGrid'
import EventThemePicker from '@/components/EventThemePicker'
import { generateInviteCode, formatInviteCode } from '@/lib/utils'
import { EventTheme } from '@/lib/event-themes'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function CreatePotluckPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Form state
  const [step, setStep] = useState(1)
  const [cuisine, setCuisine] = useState('')
  const [eventTheme, setEventTheme] = useState<string | null>(null)  // optional vibe/occasion
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [location, setLocation] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [potluckId, setPotluckId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect to login if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signup')
    }
  }, [authLoading, user, router])

  // Don't render anything while checking auth
  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  // Tiny step indicator shown at the top of every step
  function StepBadge() {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
        <span>Step {step} of 4</span>
        <div className="flex gap-1">
          {[1,2,3,4].map(n => (
            <div key={n} className={`h-1.5 rounded-full transition-all ${
              n === step ? 'w-4 bg-orange-400' : n < step ? 'w-1.5 bg-orange-200' : 'w-1.5 bg-gray-200'
            }`} />
          ))}
        </div>
      </div>
    )
  }

  // Step 1: Pick a cuisine theme
  if (step === 1) {
    return (
      <div className="space-y-5">
        <StepBadge />
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">
            Pick a Cuisine 🍽️
          </h2>
          <p className="text-sm text-gray-500">
            Everyone will get a recipe from this cuisine
          </p>
        </div>

        <CuisineGrid selected={cuisine} onSelect={setCuisine} />

        <button
          onClick={() => cuisine && setStep(2)}
          disabled={!cuisine}
          className="w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40 transition-opacity"
        >
          Next →
        </button>
      </div>
    )
  }

  // Step 2: Pick an OPTIONAL event/vibe theme
  if (step === 2) {
    return (
      <div className="space-y-5">
        <StepBadge />
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">
            Pick a Vibe 🎭 <span className="text-xs font-semibold text-gray-400 align-middle">(optional)</span>
          </h2>
          <p className="text-sm text-gray-500">
            Want to add a fun theme on top of your cuisine? Browse over 80 themes
            or pull the lever and let the slot machine pick for you.
          </p>
        </div>

        <EventThemePicker
          selected={eventTheme}
          onSelect={(theme) => setEventTheme(theme ? theme.name : null)}
        />

        <div className="flex gap-3 sticky bottom-2 bg-gray-50/95 backdrop-blur p-2 -mx-2 rounded-xl">
          <button
            onClick={() => setStep(1)}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm"
          >
            ← Back
          </button>
          <button
            onClick={() => setStep(3)}
            className="flex-1 gradient-primary text-white font-bold py-3 rounded-xl text-sm"
          >
            {eventTheme ? 'Next →' : 'Skip →'}
          </button>
        </div>
      </div>
    )
  }

  // Step 3: Event details
  if (step === 3) {
    return (
      <div className="space-y-5">
        <StepBadge />
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">
            Event Details 📋
          </h2>
          <p className="text-sm text-gray-500">
            Tell your guests when and where
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Potluck Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Friday Fiesta"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., My place, 123 Main St"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setStep(2)}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm"
          >
            ← Back
          </button>
          <button
            onClick={async () => {
              if (!name.trim()) {
                setError('Please enter a potluck name')
                return
              }
              setLoading(true)
              setError('')

              const code = generateInviteCode()

              // Save the potluck to Supabase — includes optional event_theme
              const { data: newPotluck, error: dbError } = await supabase
                .from('potlucks')
                .insert({
                  name: name.trim(),
                  invite_code: code,
                  cuisine_theme: cuisine,
                  event_theme: eventTheme,        // optional vibe/occasion
                  host_id: user.id,
                  event_date: eventDate || null,
                  event_time: eventTime || null,
                  location: location.trim() || null,
                })
                .select('id')
                .single()

              if (dbError) {
                setError('Failed to create potluck: ' + dbError.message)
                setLoading(false)
                return
              }

              // Also add the host as a member (so it shows up on the home screen)
              if (newPotluck) {
                await supabase.from('potluck_members').insert({
                  potluck_id: newPotluck.id,
                  user_id: user.id,
                  rsvp_status: 'accepted',
                })
                setPotluckId(newPotluck.id)
              }

              setInviteCode(code)
              setLoading(false)
              setStep(4)
            }}
            disabled={loading}
            className="flex-1 gradient-primary text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create! 🎉'}
          </button>
        </div>
      </div>
    )
  }

  // Step 4: Show invite code
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          Potluck Created!
        </h2>
        <p className="text-sm text-gray-500">
          Share this code with your friends so they can join
        </p>
      </div>

      {/* Big invite code display */}
      <div className="bg-white rounded-2xl p-6 card-shadow w-full">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">
          Invite Code
        </p>
        <p className="text-3xl font-extrabold tracking-widest text-orange-500">
          {formatInviteCode(inviteCode)}
        </p>
      </div>

      <button
        onClick={() => {
          navigator.clipboard?.writeText(formatInviteCode(inviteCode))
        }}
        className="text-sm text-orange-500 font-semibold"
      >
        📋 Copy to Clipboard
      </button>

      <div className="flex gap-3 w-full">
        {potluckId && (
          <button
            onClick={() => router.push(`/potluck/${potluckId}`)}
            className="flex-1 gradient-primary text-white font-bold py-3 rounded-xl text-sm"
          >
            View Potluck
          </button>
        )}
        <button
          onClick={() => router.push('/')}
          className={`${potluckId ? 'flex-1' : 'w-full'} border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm`}
        >
          Go to Home
        </button>
      </div>
    </div>
  )
}
