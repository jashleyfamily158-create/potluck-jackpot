/**
 * Spin Wheel Component
 *
 * An animated spinning wheel that lands on a random recipe.
 * The wheel shows recipe names around the edge, spins with
 * a satisfying animation, and reveals the assigned recipe
 * when it stops.
 *
 * Uses CSS transforms and transitions for the spin animation.
 */

'use client'

import { useState, useCallback } from 'react'
import type { Recipe } from '@/lib/recipes'

interface SpinWheelProps {
  recipes: Recipe[]
  onResult: (recipe: Recipe) => void
}

// Colors for the wheel segments — matches our playful design system
const SEGMENT_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC93C', '#4ECDC4',
  '#A06CD5', '#27AE60', '#E74C3C', '#3498DB',
  '#F39C12', '#8E44AD', '#1ABC9C', '#E67E22',
]

export default function SpinWheel({ recipes, onResult }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<Recipe | null>(null)

  // How many segments we show on the wheel (max 8 for readability)
  const displayRecipes = recipes.slice(0, 8)
  const segmentAngle = 360 / displayRecipes.length

  const spin = useCallback(() => {
    if (spinning) return

    setSpinning(true)
    setResult(null)

    // Pick a random recipe from the FULL list (not just displayed ones)
    const winnerIndex = Math.floor(Math.random() * recipes.length)
    const winner = recipes[winnerIndex]

    // Calculate how much to spin:
    // At least 5 full rotations + land on the winning segment
    const displayIndex = winnerIndex % displayRecipes.length
    const targetAngle = 360 - (displayIndex * segmentAngle + segmentAngle / 2)
    const totalRotation = rotation + 1800 + targetAngle // 5 full spins + target

    setRotation(totalRotation)

    // After the animation completes, show the result
    setTimeout(() => {
      setResult(winner)
      setSpinning(false)
      onResult(winner)
    }, 4000) // matches the CSS transition duration
  }, [spinning, rotation, recipes, displayRecipes, segmentAngle, onResult])

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* The wheel container */}
      <div className="relative w-72 h-72">
        {/* Pointer triangle at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-gray-800" />
        </div>

        {/* The spinning wheel */}
        <div
          className="w-full h-full rounded-full overflow-hidden border-4 border-gray-800 relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
              : 'none',
          }}
        >
          {/* SVG wheel segments */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {displayRecipes.map((recipe, i) => {
              const startAngle = i * segmentAngle
              const endAngle = startAngle + segmentAngle
              const startRad = (startAngle * Math.PI) / 180
              const endRad = (endAngle * Math.PI) / 180

              const x1 = 100 + 100 * Math.cos(startRad)
              const y1 = 100 + 100 * Math.sin(startRad)
              const x2 = 100 + 100 * Math.cos(endRad)
              const y2 = 100 + 100 * Math.sin(endRad)

              const largeArc = segmentAngle > 180 ? 1 : 0

              // Text position (middle of the segment, partway out from center)
              const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180
              const textX = 100 + 60 * Math.cos(midAngle)
              const textY = 100 + 60 * Math.sin(midAngle)
              const textRotation = (startAngle + endAngle) / 2

              return (
                <g key={i}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                    stroke="white"
                    strokeWidth="1"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="5.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  >
                    {recipe.name.length > 18
                      ? recipe.name.substring(0, 16) + '...'
                      : recipe.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-800 border-4 border-white flex items-center justify-center">
          <span className="text-white text-lg">🎰</span>
        </div>
      </div>

      {/* Spin button */}
      {!result && (
        <button
          onClick={spin}
          disabled={spinning}
          className="gradient-primary text-white font-extrabold text-lg py-4 px-12 rounded-2xl disabled:opacity-60 transition-all transform hover:scale-105 active:scale-95"
        >
          {spinning ? '🎰 Spinning...' : '🎰 SPIN!'}
        </button>
      )}
    </div>
  )
}
