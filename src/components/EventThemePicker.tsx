/**
 * EventThemePicker — lets the host pick an OPTIONAL event/vibe theme.
 *
 * Two modes side by side via tabs:
 *   1. 🔍 Browse — search bar + category filter chips + scrollable theme grid
 *   2. 🎰 Slot Machine — casino reels that randomly land on a theme
 *
 * The host can also "skip" — event themes are optional. The picker is shown as
 * a step in the create-potluck flow after cuisine + event details.
 */

'use client'

import { useMemo, useState } from 'react'
import {
  EVENT_THEMES,
  EVENT_CATEGORIES,
  EventTheme,
  EventCategory,
  searchThemes,
} from '@/lib/event-themes'
import SlotMachine from './SlotMachine'

interface Props {
  selected: string | null
  onSelect: (theme: EventTheme | null) => void
}

type Mode = 'browse' | 'slot'

export default function EventThemePicker({ selected, onSelect }: Props) {
  const [mode,     setMode]     = useState<Mode>('browse')
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState<EventCategory | null>(null)

  // Compute the visible list based on search query + category filter
  const visible = useMemo(() => {
    let list = query.trim() ? searchThemes(query) : EVENT_THEMES
    if (category) list = list.filter(t => t.category === category)
    return list
  }, [query, category])

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setMode('browse')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === 'browse' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'
          }`}
        >
          🔍 Browse
        </button>
        <button
          onClick={() => setMode('slot')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            mode === 'slot' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500'
          }`}
        >
          🎰 Slot Machine
        </button>
      </div>

      {/* ─────────────── BROWSE MODE ─────────────── */}
      {mode === 'browse' && (
        <div className="space-y-3">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search themes... (e.g. Mafia, Christmas)"
              className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category filter chips — horizontally scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <CategoryChip label="All" emoji="✨" active={!category} onClick={() => setCategory(null)} />
            {EVENT_CATEGORIES.map(c => (
              <CategoryChip
                key={c.name}
                label={c.name}
                emoji={c.emoji}
                active={category === c.name}
                onClick={() => setCategory(c.name)}
              />
            ))}
          </div>

          {/* Result count */}
          <p className="text-xs text-gray-400">
            {visible.length} theme{visible.length === 1 ? '' : 's'}
            {category && ` in ${category}`}
            {query && ` matching "${query}"`}
          </p>

          {/* Theme grid — two cards per row */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
            {visible.map(theme => (
              <ThemeCard
                key={theme.name}
                theme={theme}
                isSelected={selected === theme.name}
                onClick={() => onSelect(theme)}
              />
            ))}
            {visible.length === 0 && (
              <p className="col-span-2 text-center text-gray-400 text-sm py-8">
                No themes match. Try a different search!
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─────────────── SLOT MACHINE MODE ─────────────── */}
      {mode === 'slot' && (
        <div className="space-y-4 py-2">
          <p className="text-center text-sm text-gray-500">
            Pull the lever to let fate pick your vibe!
          </p>
          <SlotMachine onLand={(theme) => onSelect(theme)} />
        </div>
      )}

      {/* ─────────────── SELECTED PREVIEW ─────────────── */}
      {selected && (
        <SelectedPreview themeName={selected} onClear={() => onSelect(null)} />
      )}
    </div>
  )
}

// ── Category filter chip ─────────────────────────────────────────────────────

function CategoryChip({
  label, emoji, active, onClick,
}: { label: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
        active
          ? 'bg-orange-500 text-white shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200'
      }`}
    >
      <span className="mr-1">{emoji}</span>{label}
    </button>
  )
}

// ── Single theme card in the browse grid ─────────────────────────────────────

function ThemeCard({
  theme, isSelected, onClick,
}: { theme: EventTheme; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-xl border-2 transition-all ${
        isSelected ? 'shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
      style={isSelected ? { borderColor: theme.color, background: `${theme.color}0d` } : {}}
    >
      <div className="text-3xl mb-1">{theme.emoji}</div>
      <p className="font-extrabold text-sm text-gray-900 leading-tight">{theme.name}</p>
      <p className="text-[10px] text-gray-400 italic mt-0.5 line-clamp-2">{theme.tagline}</p>
    </button>
  )
}

// ── Big preview card showing the currently-selected theme ────────────────────

function SelectedPreview({
  themeName, onClear,
}: { themeName: string; onClear: () => void }) {
  const theme = EVENT_THEMES.find(t => t.name === themeName)
  if (!theme) return null
  return (
    <div
      className="rounded-2xl p-4 text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.color}cc 100%)`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-5xl">{theme.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Picked!</p>
          <p className="font-extrabold text-lg leading-tight">{theme.name}</p>
          <p className="text-xs opacity-90 italic mt-0.5">{theme.tagline}</p>
        </div>
        <button
          onClick={onClear}
          className="bg-white/20 hover:bg-white/30 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0"
          aria-label="Clear selection"
        >
          ✕
        </button>
      </div>

      {/* Dish ideas */}
      <div className="mt-3">
        <p className="text-[10px] opacity-80 uppercase tracking-wider font-bold mb-1">Dish Ideas</p>
        <div className="flex flex-wrap gap-1.5">
          {theme.ideas.slice(0, 4).map(idea => (
            <span key={idea}
              className="text-[11px] bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 font-semibold">
              {idea}
            </span>
          ))}
        </div>
      </div>

      {/* Optional dress code */}
      {theme.dressCode && (
        <div className="mt-2.5 text-xs opacity-90">
          <span className="font-bold">👗 Dress code:</span> {theme.dressCode}
        </div>
      )}
    </div>
  )
}
