/**
 * Spin Wheel Component — upgraded
 *
 * Changes from v1:
 * - Larger wheel (320px)
 * - Pulsing glow ring appears while spinning
 * - Gradient center button with shadow
 * - Bolder pointer with a drop shadow
 * - Segment text slightly larger for readability
 */

'use client'

import { useState, useCallback } from 'react'
import type { Recipe } from '@/lib/recipes'

interface SpinWheelProps {
  recipes: Recipe[]
  onResult: (recipe: Recipe) => void
}

const SEGMENT_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC93C', '#4ECDC4',
  '#A06CD5', '#27AE60', '#E74C3C', '#3498DB',
  '#F39C12', '#8E44AD', '#1ABC9C', '#E67E22',
]

export default function SpinWheel({ recipes, onResult }: SpinWheelProps) {
  const [spinning,  setSpinning]  = useState(false)
  const [rotation,  setRotation]  = useState(0)
  const [result,    setResult]    = useState<Recipe | null>(null)

  const displayRecipes = recipes.slice(0, 8)
  const segmentAngle   = 360 / displayRecipes.length

  const spin = useCallback(() => {
    if (spinning) return

    setSpinning(true)
    setResult(null)

    const winnerIndex    = Math.floor(Math.random() * recipes.length)
    const winner         = recipes[winnerIndex]
    const displayIndex   = winnerIndex % displayRecipes.length
    const targetAngle    = 360 - (displayIndex * segmentAngle + segmentAngle / 2)
    const totalRotation  = rotation + 1800 + targetAngle

    setRotation(totalRotation)

    setTimeout(() => {
      setResult(winner)
      setSpinning(false)
      onResult(winner)
    }, 4200)
  }, [spinning, rotation, recipes, displayRecipes, segmentAngle, onResult])

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Glow ring + wheel wrapper */}
      <div className="relative w-80 h-80">

        {/* Pulsing glow ring — only shows while spinning */}
        {spinning && (
          <div
            className="absolute inset-[-8px] rounded-full animate-ping"
            style={{
              background: 'radial-gradient(circle, rgba(160,108,213,0.4) 0%, transparent 70%)',
              animationDuration: '1.2s',
            }}
          />
        )}

        {/* Static outer glow ring */}
        <div
          className="absolute inset-[-4px] rounded-full transition-all duration-500"
          style={{
            boxShadow: spinning
              ? '0 0 40px 12px rgba(160,108,213,0.5), 0 0 80px 20px rgba(255,107,107,0.3)'
              : '0 0 20px 4px rgba(0,0,0,0.08)',
          }}
        />

        {/* Pointer — bold downward triangle at top */}
        <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
          <div
            className="w-0 h-0"
            style={{
              borderLeft:  '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop:   '24px solid #1F2937',
            }}
          />
        </div>

        {/* The spinning wheel */}
        <div
          className="w-full h-full rounded-full overflow-hidden relative"
          style={{
            transform:  `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.08, 0.99)' : 'none',
            boxShadow:  'inset 0 0 0 4px #1F2937, 0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {displayRecipes.map((recipe, i) => {
              const start    = i * segmentAngle
              const end      = start + segmentAngle
              const startRad = (start * Math.PI) / 180
              const endRad   = (end   * Math.PI) / 180
              const x1 = 100 + 100 * Math.cos(startRad)
              const y1 = 100 + 100 * Math.sin(startRad)
              const x2 = 100 + 100 * Math.cos(endRad)
              const y2 = 100 + 100 * Math.sin(endRad)
              const mid    = ((start + end) / 2) * Math.PI / 180
              const textX  = 100 + 62 * Math.cos(mid)
              const textY  = 100 + 62 * Math.sin(mid)
              const textRot = (start + end) / 2

              return (
                <g key={i}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${segmentAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`}
                    fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={textX} y={textY}
                    fill="white"
                    fontSize="6"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRot}, ${textX}, ${textY})`}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {recipe.name.length > 16 ? recipe.name.substring(0, 14) + '…' : recipe.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Center button / hub */}
        <button
          onClick={spin}
          disabled={spinning || !!result}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full z-10 flex items-center justify-center transition-transform active:scale-95 disabled:cursor-not-allowed"
          style={{
            background: spinning
              ? 'linear-gradient(135deg, #A06CD5, #7C4DFF)'
              : 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            boxShadow: '0 0 0 4px white, 0 4px 16px rgba(0,0,0,0.25)',
          }}
        >
          <span className="text-2xl">{spinning ? '🌀' : '🎰'}</span>
        </button>
      </div>

      {/* Spin CTA button — below the wheel */}
      {!result && (
        <button
          onClick={spin}
          disabled={spinning}
          className="gradient-primary text-white font-extrabold text-lg py-4 px-14 rounded-2xl shadow-lg disabled:opacity-60 transition-all transform hover:scale-105 active:scale-95"
          style={{
            boxShadow: spinning ? 'none' : '0 4px 20px rgba(255,107,107,0.4)',
          }}
        >
          {spinning ? '🌀 Spinning…' : '🎰 SPIN!'}
        </button>
      )}

      {/* Subtle hint text */}
      {!spinning && !result && (
        <p className="text-xs text-gray-400">
          Tap the button or the center of the wheel
        </p>
      )}
    </div>
  )
}
