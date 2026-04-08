/**
 * Shared utility functions used across the app
 */

/**
 * Generate a random 6-character invite code for potlucks.
 * Uses uppercase letters and digits, but excludes ambiguous
 * characters (O, 0, I, 1, l) so codes are easy to read aloud.
 * Displayed as "PJ-XXXXXX"
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Format an invite code for display: "K7M2XR" → "PJ-K7M2XR"
 */
export function formatInviteCode(code: string): string {
  return `PJ-${code.toUpperCase()}`
}

/**
 * Parse a user-entered invite code, stripping the "PJ-" prefix if present.
 * Case-insensitive.
 */
export function parseInviteCode(input: string): string {
  return input.toUpperCase().replace('PJ-', '').trim()
}

/**
 * Cuisine themes with their emoji and brand color
 */
export const CUISINE_THEMES = [
  { name: 'American Classic', emoji: '🍔', color: '#E74C3C' },
  { name: 'Italian', emoji: '🍝', color: '#27AE60' },
  { name: 'Mexican', emoji: '🌮', color: '#F39C12' },
  { name: 'Chinese', emoji: '🥡', color: '#C0392B' },
  { name: 'Greek', emoji: '🫒', color: '#2980B9' },
  { name: 'Japanese', emoji: '🍣', color: '#8E44AD' },
  { name: 'Indian', emoji: '🍛', color: '#D35400' },
  { name: 'French', emoji: '🥐', color: '#1ABC9C' },
  { name: 'Thai', emoji: '🍜', color: '#E67E22' },
  { name: 'Random Mix', emoji: '🎲', color: '#9B59B6' },
] as const

/**
 * Difficulty levels for recipes
 */
export const DIFFICULTY_LEVELS = [
  { label: 'Beginner', stars: 1, description: 'Under 45 min, basic techniques' },
  { label: 'Intermediate', stars: 2, description: '45 min - 2 hrs, some skill required' },
  { label: 'Expert', stars: 3, description: '2+ hrs or advanced techniques' },
] as const

/**
 * Format a date nicely for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format time for display (e.g., "18:00" → "6:00 PM")
 */
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}
