/**
 * Invite Email API Route
 *
 * Sends a potluck invite email to a friend.
 *
 * For now, this uses a simple approach: it constructs
 * a mailto: URL and returns it so the client can open it.
 * This opens the user's default email app (Gmail, Outlook, etc.)
 * with a pre-filled subject and body.
 *
 * In the future, you can replace this with a proper email service
 * like Resend, SendGrid, or Mailgun for fully automated sending.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      to,
      friendName,
      potluckName,
      cuisineTheme,
      cuisineEmoji,
      inviteCode,
      deepLink,
      eventDate,
      eventTime,
      location,
    } = body

    if (!to || !potluckName || !inviteCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Build the email subject
    const subject = `🎰 You're invited to ${potluckName} — Potluck Jackpot!`

    // Build the email body
    const greeting = friendName ? `Hey ${friendName}!` : 'Hey!'
    const emailBody = `${greeting}

You're invited to join my potluck on Potluck Jackpot! 🎉

${cuisineEmoji} Potluck: ${potluckName}
🍽️ Cuisine: ${cuisineTheme}${eventDate ? `\n📅 Date: ${eventDate}` : ''}${eventTime ? `\n🕐 Time: ${eventTime}` : ''}${location ? `\n📍 Location: ${location}` : ''}

Here's how to join:
👉 Tap this link: ${deepLink || `https://potluck-jackpot.vercel.app/potluck/join?code=${inviteCode}`}

Or enter the code manually: ${inviteCode}

You'll get a random ${cuisineTheme} recipe to cook and bring. It's like a game show meets dinner party!

See you there! 🎰🍳`

    // Build the mailto URL
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`

    return NextResponse.json({
      success: true,
      mailtoUrl,
      // Also return raw data in case client wants to use it differently
      subject,
      body: emailBody,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    )
  }
}
