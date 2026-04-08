/**
 * Invite Friends Component
 *
 * Gives users multiple ways to invite friends to a potluck:
 * 1. Copy invite code (already existed)
 * 2. Send email invite (opens a form, sends via API)
 * 3. Share button (uses device's native share — works with
 *    iMessage, WhatsApp, Messenger, Telegram, etc.)
 *
 * The email sends a fun, branded invite with the potluck details
 * and invite code. The share button creates a pre-written message
 * that the user can send through any app on their phone.
 */

'use client'

import { useState } from 'react'

interface InviteFriendsProps {
  potluckName: string
  cuisineTheme: string
  cuisineEmoji: string
  inviteCode: string
  formattedCode: string
  eventDate?: string
  eventTime?: string
  location?: string
}

export default function InviteFriends({
  potluckName,
  cuisineTheme,
  cuisineEmoji,
  inviteCode,
  formattedCode,
  eventDate,
  eventTime,
  location,
}: InviteFriendsProps) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [friendName, setFriendName] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Build the shareable deep link — anyone who taps it goes straight to the join page
  const deepLink = `https://potluck-jackpot.vercel.app/potluck/join?code=${formattedCode}`

  // Build the invite message text (used by both email and share)
  const inviteMessage = `🎰 You're invited to "${potluckName}"!\n\n${cuisineEmoji} Cuisine: ${cuisineTheme}\n${eventDate ? `📅 Date: ${eventDate}\n` : ''}${eventTime ? `🕐 Time: ${eventTime}\n` : ''}${location ? `📍 Location: ${location}\n` : ''}\nJoin here 👉 ${deepLink}\n\n(or enter code ${formattedCode} at potluck-jackpot.vercel.app)`

  // Copy invite code to clipboard
  function handleCopy() {
    navigator.clipboard?.writeText(formattedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Copy the full deep link to clipboard
  function handleCopyLink() {
    navigator.clipboard?.writeText(deepLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Native share (works on mobile — SMS, WhatsApp, Messenger, etc.)
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my potluck: ${potluckName}`,
          text: inviteMessage,
          url: deepLink,
        })
      } catch {
        // User cancelled the share — that's fine
      }
    } else {
      // Fallback for desktop: copy link to clipboard
      navigator.clipboard?.writeText(deepLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  // Send email invite via our API route
  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          friendName: friendName.trim() || undefined,
          potluckName,
          cuisineTheme,
          cuisineEmoji,
          inviteCode: formattedCode,
          deepLink,
          eventDate,
          eventTime,
          location,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send invite')
      }

      const data = await res.json()

      // Open the user's email app with the pre-filled invite
      if (data.mailtoUrl) {
        window.open(data.mailtoUrl, '_blank')
      }

      setSent(true)
      setEmail('')
      setFriendName('')
      // Reset after 3 seconds so they can send another
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    }

    setSending(false)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-extrabold text-gray-900">
        Invite Friends 🎉
      </h3>

      {/* Invite code + link with copy buttons */}
      <div className="bg-white rounded-xl p-4 card-shadow text-center space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Invite Code
        </p>
        <p className="text-2xl font-extrabold tracking-widest text-orange-500">
          {formattedCode}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleCopy}
            className="text-xs text-orange-400 font-semibold bg-orange-50 px-3 py-1.5 rounded-lg"
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
          <button
            onClick={handleCopyLink}
            className="text-xs text-purple-500 font-semibold bg-purple-50 px-3 py-1.5 rounded-lg"
          >
            {copiedLink ? '✅ Copied!' : '🔗 Copy Link'}
          </button>
        </div>
        <p className="text-xs text-gray-400 truncate">{deepLink}</p>
      </div>

      {/* Share and Email buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 bg-[#4ECDC4] text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          📱 Share via Text
        </button>
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="flex-1 bg-[#A06CD5] text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          ✉️ Email Invite
        </button>
      </div>

      {/* Email form (expandable) */}
      {showEmailForm && (
        <form onSubmit={handleSendEmail} className="bg-white rounded-xl p-4 card-shadow space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Friend&apos;s Name (optional)
            </label>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="e.g., Jamie"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Friend&apos;s Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          {sent ? (
            <p className="text-green-600 text-sm text-center font-semibold">
              ✅ Invite sent!
            </p>
          ) : (
            <button
              type="submit"
              disabled={sending || !email}
              className="w-full bg-[#A06CD5] text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-40"
            >
              {sending ? 'Sending...' : 'Send Invite ✉️'}
            </button>
          )}
        </form>
      )}
    </div>
  )
}
