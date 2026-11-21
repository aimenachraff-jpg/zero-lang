'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const supabase = getBrowserSupabaseClient()
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/progress'

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError(error.message)
          return
        }
      }

      // Session is now in cookies (readable by middleware). Go to destination.
      router.replace(next)
      router.refresh()
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        {error ? (
          <>
            <h1 className="text-xl font-semibold">Sign-in failed</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <a href="/auth/signin" className="text-sm text-primary hover:underline">
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Completing sign in…</p>
          </>
        )}
      </div>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}
