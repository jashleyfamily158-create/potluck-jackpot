/**
 * Supabase Client Setup
 *
 * This file creates the connection between your app and Supabase.
 * We use createBrowserClient for client-side code (React components).
 * The keys come from .env.local — never hardcode them here.
 */

import { createClient } from '@supabase/supabase-js'

// These environment variables are set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create and export the Supabase client
// This is what you use throughout the app to talk to the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
