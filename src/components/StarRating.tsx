/**
 * Star Rating Component
 *
 * A tappable 1-5 star rating input.
 * Stars fill in with a warm gold color when selected.
 */

'use client'

interface StarRatingProps {
  rating: number
  onRate: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({
  rating,
  onRate,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl'

  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRate(star)}
          disabled={readonly}
          className={`transition-transform ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
          }`}
        >
          {star <= rating ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}
