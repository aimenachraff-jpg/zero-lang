import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Signup stores full_name, native_language and learning_goal in auth metadata,
 * but the profile tables are created by a trigger that only copies the email.
 * Copy the missing fields across once so the dashboard shows real values.
 */
export async function syncLearnerMetadata(user: {
  id: string
  user_metadata?: Record<string, any>
}) {
  const meta = user.user_metadata ?? {}
  if (!meta.full_name && !meta.native_language && !meta.learning_goal) return

  const supabase = createServerSupabaseClient()
  if (!supabase) return // build CI: no Supabase available
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('full_name, native_language')
    .eq('id', user.id)
    .maybeSingle()

  if (profile) {
    const patch: Record<string, string> = {}
    if (meta.full_name && profile.full_name !== meta.full_name) patch.full_name = meta.full_name
    if (meta.native_language && profile.native_language !== meta.native_language) {
      patch.native_language = meta.native_language
    }
    if (Object.keys(patch).length) {
      await (supabase.from('profiles') as any).update(patch).eq('id', user.id)
    }
  }

  const { data: learner } = await (supabase.from('learner_profiles') as any)
    .select('primary_goal')
    .eq('user_id', user.id)
    .maybeSingle()

  if (learner && meta.learning_goal && learner.primary_goal !== meta.learning_goal) {
    await (supabase.from('learner_profiles') as any)
      .update({ primary_goal: meta.learning_goal })
      .eq('user_id', user.id)
  }
}

/** Supabase client for Server Components. Reads the session from cookies.
 *  Returns a no-op client when env vars are absent (build CI), deferring errors to call time.
 */
export function createServerSupabaseClient(): ReturnType<typeof createServerClient<Database>> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // @supabase/ssr 0.3.x API
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Components cannot write cookies; middleware refreshes them.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Same as above.
          }
        },
        // Forward-compatible with @supabase/ssr >= 0.4
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            )
          } catch {
            // Same as above.
          }
        },
      },
    }
  )
}
