/**
 * Spin Page — Dramatic edition
 *
 * Before spinning: dark purple gradient background, wheel is the star.
 * After spinning: full-screen celebration overlay with confetti burst,
 * the recipe name in massive text, then transitions to the detail card.
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SpinWheel from '@/components/SpinWheel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { getRecipesForCuisine } from '@/lib/recipes'
import type { Recipe } from '@/lib/recipes'

// ── Confetti particle ──────────────────────────────────────────────────────────

interface ConfettiPiece {
  left: string
  delay: string
  duration: string
  color: string
  width: number
  height: number
  rotate: number
}

const CONFETTI_COLORS = [
  '#FF6B6B', '#FF8E53', '#FFC93C', '#4ECDC4',
  '#A06CD5', '#27AE60', '#3498DB', '#F39C12',
  '#ffffff', '#FFD700',
]

function generateConfetti(count = 60): ConfettiPiece[] {
  return Array.from({ length: count }, () => ({
    left:     `${Math.random() * 100}%`,
    delay:    `${(Math.random() * 0.6).toFixed(2)}s`,
    duration: `${(0.9 + Math.random() * 0.8).toFixed(2)}s`,
    color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    width:    Math.floor(Math.random() * 10 + 5),
    height:   Math.floor(Math.random() * 6 + 4),
    rotate:   Math.floor(Math.random() * 360),
  }))
}

function Confetti() {
  const pieces = useRef(generateConfetti(60))
  return (
    <>
      <style>{`
        @keyframes confetti-drop {
          0%   { transform: translateY(-30px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0.2; }
        }
      `}</style>
      {pieces.current.map((p, i) => (
        <div
          key={i}
          className="fixed top-0 pointer-events-none z-[60] rounded-sm"
          style={{
            left:            p.left,
            width:           p.width,
            height:          p.height,
            backgroundColor: p.color,
            animation:       `confetti-drop ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SpinPage() {
  const params    = useParams()
  const router    = useRouter()
  const { user }  = useAuth()
  const potluckId = params.id as string

  const [cuisine,        setCuisine]        = useState('')
  const [potluckName,    setPotluckName]    = useState('')
  const [recipes,        setRecipes]        = useState<Recipe[]>([])
  const [assignedRecipe, setAssignedRecipe] = useState<Recipe | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [showCelebration,setShowCelebration]= useState(false)
  const [showDetails,    setShowDetails]    = useState(false)

  useEffect(() => {
    async function load() {
      const { data: potluck } = await supabase
        .from('potlucks')
        .select('cuisine_theme, name')
        .eq('id', potluckId)
        .single()

      if (potluck) {
        setCuisine(potluck.cuisine_theme)
        setPotluckName(potluck.name)
        setRecipes(getRecipesForCuisine(potluck.cuisine_theme))
      }

      if (user) {
        const { data: member } = await supabase
          .from('potluck_members')
          .select('assigned_recipe_name')
          .eq('potluck_id', potluckId)
          .eq('user_id', user.id)
          .single()

        if (member?.assigned_recipe_name) {
          const all = getRecipesForCuisine(potluck?.cuisine_theme || '')
          const existing = all.find(r => r.name === member.assigned_recipe_name)
          if (existing) {
            setAssignedRecipe(existing)
            setShowDetails(true) // already spun, go straight to details
          }
        }
      }

      setLoading(false)
    }
    load()
  }, [potluckId, user])

  async function handleSpinResult(recipe: Recipe) {
    setSaving(true)

    if (user) {
      await supabase
        .from('potluck_members')
        .update({
          assigned_recipe_name:          recipe.name,
          assigned_recipe_url:           recipe.url,
          assigned_recipe_source:        recipe.source,
          assigned_recipe_difficulty:    recipe.difficulty,
          assigned_recipe_time:          recipe.time,
          assigned_recipe_youtube_query: recipe.youtubeQuery,
        })
        .eq('potluck_id', potluckId)
        .eq('user_id', user.id)
    }

    setAssignedRecipe(recipe)
    setSaving(false)

    // Trigger the celebration overlay
    setShowCelebration(true)
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-400 text-sm animate-pulse">Loading wheel…</p>
    </div>
  )

  const youtubeUrl = assignedRecipe
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(assignedRecipe.youtubeQuery)}`
    : ''

  // ── Already spun — show details directly ──────────────────────────────────

  if (showDetails && assignedRecipe) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-5xl mb-2">✅</div>
          <h2 className="text-2xl font-extrabold text-gray-900">Your Recipe!</h2>
          <p className="text-sm text-gray-400 mt-1">You already spun — here&apos;s your assignment</p>
        </div>

        <RecipeDetailCard recipe={assignedRecipe} cuisine={cuisine} youtubeUrl={youtubeUrl} />

        <button
          onClick={() => router.push(`/potluck/${potluckId}`)}
          className="w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm"
        >
          ← Back to Potluck
        </button>
      </div>
    )
  }

  // ── Main spin view ─────────────────────────────────────────────────────────

  return (
    <>
      {/* Dark dramatic background — covers the whole screen behind the nav */}
      <style>{`
        @keyframes fade-in-up {
          0%   { opacity: 0; transform: translateY(24px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes celebration-bg {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Dark gradient behind everything */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(160deg, #1a0533 0%, #2d1465 50%, #0d1f3c 100%)' }}
      />

      {/* ── Pre-spin content ── */}
      <div className="relative z-10 flex flex-col items-center gap-6 pt-2 pb-8">

        {/* Header */}
        <div className="text-center">
          <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">{potluckName}</p>
          <h2 className="text-2xl font-extrabold text-white">Spin the Wheel! 🎰</h2>
          <p className="text-sm text-white/50 mt-1">Your random {cuisine} recipe awaits…</p>
        </div>

        {/* The wheel */}
        <SpinWheel recipes={recipes} onResult={handleSpinResult} />

        {saving && (
          <p className="text-purple-300 text-xs animate-pulse">Saving your assignment…</p>
        )}
      </div>

      {/* ── Celebration overlay — full screen, fires after spin ── */}
      {showCelebration && assignedRecipe && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
          style={{
            background: 'linear-gradient(135deg, #7C4DFF 0%, #A06CD5 40%, #FF8E53 100%)',
            animation: 'celebration-bg 0.4s ease-out forwards',
          }}
        >
          <Confetti />

          {/* Recipe reveal */}
          <div
            className="relative z-10 text-center"
            style={{ animation: 'fade-in-up 0.6s 0.3s ease-out both' }}
          >
            <div className="text-7xl mb-4">🎉</div>
            <p className="text-white/70 font-bold text-sm uppercase tracking-widest mb-2">
              Your recipe is…
            </p>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
              {assignedRecipe.name}
            </h2>
            <div className="flex gap-2 justify-center flex-wrap mb-8">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {assignedRecipe.difficulty === 'Beginner'     ? '⭐' :
                 assignedRecipe.difficulty === 'Intermediate' ? '⭐⭐' : '⭐⭐⭐'} {assignedRecipe.difficulty}
              </span>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                🕐 {assignedRecipe.time}
              </span>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {cuisine}
              </span>
            </div>

            <button
              onClick={() => { setShowCelebration(false); setShowDetails(true) }}
              className="bg-white text-purple-600 font-extrabold text-base py-4 px-10 rounded-2xl shadow-xl"
            >
              See Recipe Details →
            </button>
          </div>
        </div>
      )}

      {/* ── Post-celebration detail view ── */}
      {showDetails && !showCelebration && assignedRecipe && (
        <div
          className="relative z-10 space-y-5"
          style={{ animation: 'fade-in-up 0.5s ease-out forwards' }}
        >
          <div className="text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-2xl font-extrabold text-white">Your Recipe!</h2>
          </div>

          <RecipeDetailCard recipe={assignedRecipe} cuisine={cuisine} youtubeUrl={youtubeUrl} />

          <button
            onClick={() => router.push(`/potluck/${potluckId}`)}
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl text-sm"
          >
            ← Back to Potluck
          </button>
        </div>
      )}
    </>
  )
}

// ── Recipe detail card ─────────────────────────────────────────────────────────

function RecipeDetailCard({ recipe, cuisine, youtubeUrl }: {
  recipe: Recipe
  cuisine: string
  youtubeUrl: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-2">{recipe.name}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 font-semibold">
            {recipe.difficulty === 'Beginner'     ? '⭐' :
             recipe.difficulty === 'Intermediate' ? '⭐⭐' : '⭐⭐⭐'} {recipe.difficulty}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold">
            🕐 {recipe.time}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-600 font-semibold">
            {cuisine}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full bg-orange-50 text-orange-600 font-semibold text-sm py-3 px-4 rounded-xl hover:bg-orange-100 transition-colors"
        >
          <span className="text-lg">📖</span>
          <span>View Recipe on {recipe.source}</span>
          <span className="ml-auto">›</span>
        </a>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full bg-red-50 text-red-500 font-semibold text-sm py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
        >
          <span className="text-lg">▶️</span>
          <span>Watch Tutorial on YouTube</span>
          <span className="ml-auto">›</span>
        </a>
      </div>
    </div>
  )
}
