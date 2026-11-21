/**
 * Supabase Client Configuration
 *
 * Free tier: 500MB database, 50MB file storage, 2GB bandwidth
 * Auth: Email/password, OAuth (GitHub, Google), Magic links
 *
 * This module is safe to import from any component, including during
 * Next.js static builds, even when NEXT_PUBLIC_SUPABASE_* env vars are absent.
 * It throws only at actual call time if credentials are missing.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createBrowserSupabaseClient(): ReturnType<typeof createBrowserClient<Database>> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  if (browserClient) return browserClient

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return browserClient
}

export function getBrowserSupabaseClient(): ReturnType<typeof createBrowserClient<Database>> {
  if (!browserClient) {
    createBrowserSupabaseClient()
  }
  return browserClient as ReturnType<typeof createBrowserClient<Database>>
}

// Server-only client lives in ./supabase-server.ts so this module stays
// safe to import from Client Components.

// ============================================
// Auth Helpers
// ============================================

export async function getCurrentUser() {
  const supabase = getBrowserSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Auth error:', error)
    return null
  }

  return user
}

export async function getCurrentSession() {
  const supabase = getBrowserSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Session error:', error)
    return null
  }

  return session
}

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  })

  return { data, error }
}

export async function signIn(email: string, password: string, rememberMe = false) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signInWithOAuth(provider: 'github' | 'google') {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  })

  return { data, error }
}

export async function signOut() {
  const supabase = getBrowserSupabaseClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
  })

  return { data, error }
}

export async function updatePassword(newPassword: string) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { data, error }
}

// ============================================
// Database Helpers
// ============================================

export async function getUserProfile(userId: string) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = getBrowserSupabaseClient() as any
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

export async function getLearnerProfile(userId: string) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('learner_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export async function upsertLearnerProfile(profile: any) {
  const supabase = getBrowserSupabaseClient() as any
  const { data, error } = await supabase
    .from('learner_profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single()

  return { data, error }
}

// ============================================
// Progress Helpers
// ============================================

export async function getUserProgress(userId: string, unitId?: string) {
  const supabase = getBrowserSupabaseClient()
  let query = supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (unitId) {
    query = query.eq('unit_id', unitId)
  }

  const { data, error } = await query
  return { data, error }
}

export async function upsertUserProgress(progress: any) {
  const supabase = getBrowserSupabaseClient() as any
  const { data, error } = await supabase
    .from('user_progress')
    .upsert(progress, { onConflict: 'user_id,unit_id,lesson_id' })
    .select()
    .single()

  return { data, error }
}

export async function getSkillProfile(userId: string) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('skill_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export async function upsertSkillProfile(profile: any) {
  const supabase = getBrowserSupabaseClient() as any
  const { data, error } = await supabase
    .from('skill_profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single()

  return { data, error }
}

// ============================================
// SRS Helpers
// ============================================

export async function getSRSItems(userId: string, unitId?: string) {
  const supabase = getBrowserSupabaseClient()
  let query = supabase
    .from('srs_items')
    .select('*, vocabulary:vocabulary(*)')
    .eq('user_id', userId)
    .lte('next_review', new Date().toISOString())
    .order('next_review', { ascending: true })

  if (unitId) {
    query = query.eq('unit_id', unitId)
  }

  const { data, error } = await query
  return { data, error }
}

export async function upsertSRSItem(item: any) {
  const supabase = getBrowserSupabaseClient() as any
  const { data, error } = await supabase
    .from('srs_items')
    .upsert(item, { onConflict: 'user_id,vocabulary_id' })
    .select()
    .single()

  return { data, error }
}

export async function logSRSReview(review: any) {
  const supabase = getBrowserSupabaseClient() as any
  const { data, error } = await supabase
    .from('srs_reviews')
    .insert(review)
    .select()
    .single()

  return { data, error }
}

// ============================================
// Content Helpers
// ============================================

export async function getUnits(level?: string) {
  const supabase = getBrowserSupabaseClient()
  let query = supabase
    .from('units')
    .select('*')
    .eq('published', true)
    .order('order', { ascending: true })

  if (level) {
    query = query.eq('level', level)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getUnit(unitId: string) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('units')
    .select('*, lessons(*)')
    .eq('id', unitId)
    .single()

  return { data, error }
}

export async function getVocabulary(unitId: string) {
  const supabase = getBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('unit_id', unitId)
    .order('frequency_band', { ascending: true })

  return { data, error }
}

// ============================================
// Realtime Subscriptions
// ============================================

export function subscribeToProgress(userId: string, callback: (payload: any) => void) {
  const supabase = getBrowserSupabaseClient()
  return supabase
    .channel(`progress:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}
