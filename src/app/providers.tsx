/**
 * Client-side Providers
 * 
 * Theme, Auth, Query, Toast providers for client components.
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster as SonnerToaster } from 'sonner'
import type { Session, User } from '@supabase/supabase-js'
import { getBrowserSupabaseClient } from '@/lib/supabase'

// ============================================
// Supabase Client (single cookie-based client)
// ============================================
// NOTE: Always use the shared createBrowserClient from @supabase/ssr.
// Using createClient from @supabase/supabase-js here creates a SECOND client
// backed by localStorage, so signIn() writes a cookie session that this
// provider cannot see. One client = one session = consistent auth state.

function getSupabaseClient() {
  return getBrowserSupabaseClient()
}

// ============================================
// Auth Provider
// ============================================

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
  }

  const refreshSession = async () => {
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    setUser(session?.user ?? null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ============================================
// Query Client Provider
// ============================================

function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient)
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// ============================================
// Combined Providers
// ============================================

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <QueryProvider>
          {children}
          <SonnerToaster position="bottom-right" />
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}