/**
 * Cuisine Grid Component
 *
 * Displays the 10 cuisine themes as a tappable grid.
 * Each theme shows its emoji and name with its brand color.
 * The selected theme gets a highlighted border.
 */

'use client'

import { CUISINE_THEMES } from '@/lib/utils'

interface CuisineGridProps {
  selected: string
  onSelect: (theme: string) => void
}

export default function CuisineGrid({ selected, onSelect }: CuisineGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CUISINE_THEMES.map((theme) => {
        const isSelected = selected === theme.name

        return (
          <button
            key={theme.name}
            onClick={() => onSelect(theme.name)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? 'border-orange-400 bg-orange-50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <span className="text-2xl">{theme.emoji}</span>
            <span className={`text-sm font-semibold ${
              isSelected ? 'text-orange-600' : 'text-gray-700'
            }`}>
              {theme.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
