/**
 * Auth Context
 *
 * This wraps the entire app and keeps track of who's logged in.
 * Any component can check the current user by calling useAuth().
 * It listens for Supabase auth changes (login, logout, token refresh)
 * and updates automatically.
 *
 * IMPORTANT: When a user logs in, this also ensures they have a
 * profile record in the profiles table. If one doesn't exist
 * (e.g., because signup created the auth account but the profile
 * insert failed), it creates one automatically.
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// The shape of our auth context
interface AuthContextType {
  user: User | null          // The logged-in user (or null if not logged in)
  loading: boolean           // True while we're checking if someone is logged in
  signOut: () => Promise<void>
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

// Hook that components use to access auth state
export function useAuth() {
  return useContext(AuthContext)
}

/**
 * Ensure the user has a profile record in the profiles table.
 * If not, create one using their email or metadata.
 */
async function ensureProfile(user: User) {
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingProfile) return // Profile exists, we're good

  // Profile doesn't exist — create one
  const displayName =
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'New User'

  await supabase.from('profiles').insert({
    id: user.id,
    display_name: displayName,
  })
}

// Provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if someone is already logged in when the app loads
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) ensureProfile(user)
      setLoading(false)
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) ensureProfile(currentUser)
        setLoading(false)
      }
    )

    // Clean up the listener when the component unmounts
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
