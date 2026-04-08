/**
 * Spin Page
 *
 * Where the magic happens! The user spins the wheel and gets
 * assigned a random recipe from the potluck's cuisine theme.
 * After spinning, the recipe assignment is saved to Supabase
 * and other members can see the update in real-time.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SpinWheel from '@/components/SpinWheel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { getRecipesForCuisine, getRandomRecipe } from '@/lib/recipes'
import type { Recipe } from '@/lib/recipes'

export default function SpinPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const potluckId = params.id as string

  const [cuisine, setCuisine] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [assignedRecipe, setAssignedRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadPotluck() {
      // Get the potluck's cuisine theme
      const { data: potluck } = await supabase
        .from('potlucks')
        .select('cuisine_theme')
        .eq('id', potluckId)
        .single()

      if (potluck) {
        setCuisine(potluck.cuisine_theme)
        setRecipes(getRecipesForCuisine(potluck.cuisine_theme))
      }

      // Check if this user already has a recipe assigned
      if (user) {
        const { data: member } = await supabase
          .from('potluck_members')
          .select('assigned_recipe_name')
          .eq('potluck_id', potluckId)
          .eq('user_id', user.id)
          .single()

        if (member?.assigned_recipe_name) {
          // Already spun — find the recipe details
          const allRecipes = getRecipesForCuisine(potluck?.cuisine_theme || '')
          const existing = allRecipes.find(r => r.name === member.assigned_recipe_name)
          if (existing) setAssignedRecipe(existing)
        }
      }

      setLoading(false)
    }

    loadPotluck()
  }, [potluckId, user])

  // Called when the spin wheel animation completes
  async function handleSpinResult(recipe: Recipe) {
    setAssignedRecipe(recipe)
    setSaving(true)

    // Save the recipe assignment to Supabase
    if (user) {
      await supabase
        .from('potluck_members')
        .update({
          assigned_recipe_name: recipe.name,
          assigned_recipe_url: recipe.url,
          assigned_recipe_source: recipe.source,
          assigned_recipe_difficulty: recipe.difficulty,
          assigned_recipe_time: recipe.time,
          assigned_recipe_youtube_query: recipe.youtubeQuery,
        })
        .eq('potluck_id', potluckId)
        .eq('user_id', user.id)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading wheel...</div>
      </div>
    )
  }

  // Already spun — show the result
  if (assignedRecipe) {
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(assignedRecipe.youtubeQuery)}`

    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-900">
          Your Recipe!
        </h2>

        {/* Recipe card */}
        <div className="bg-white rounded-2xl p-5 card-shadow text-left space-y-3">
          <h3 className="text-xl font-extrabold text-gray-900">
            {assignedRecipe.name}
          </h3>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 font-semibold">
              {assignedRecipe.difficulty === 'Beginner' ? '⭐' :
               assignedRecipe.difficulty === 'Intermediate' ? '⭐⭐' : '⭐⭐⭐'}{' '}
              {assignedRecipe.difficulty}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold">
              🕐 {assignedRecipe.time}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-600 font-semibold">
              {cuisine}
            </span>
          </div>

          {/* Links to recipe and YouTube */}
          <div className="space-y-2 pt-2">
            <a
              href={assignedRecipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-orange-50 text-orange-600 font-semibold text-sm py-3 rounded-xl text-center hover:bg-orange-100 transition-colors"
            >
              📖 View Recipe on {assignedRecipe.source}
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-red-50 text-red-500 font-semibold text-sm py-3 rounded-xl text-center hover:bg-red-100 transition-colors"
            >
              ▶️ Find Video Tutorial on YouTube
            </a>
          </div>
        </div>

        {saving && (
          <p className="text-xs text-gray-400">Saving your assignment...</p>
        )}

        <button
          onClick={() => router.push(`/potluck/${potluckId}`)}
          className="w-full gradient-primary text-white font-bold py-3 rounded-xl text-sm"
        >
          ← Back to Potluck
        </button>
      </div>
    )
  }

  // Haven't spun yet — show the wheel
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-xl font-extrabold text-gray-900">
        Spin for Your Recipe! 🎰
      </h2>
      <p className="text-sm text-gray-500">
        Tap the button to get your {cuisine} recipe assignment
      </p>

      <SpinWheel recipes={recipes} onResult={handleSpinResult} />
    </div>
  )
}
