import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  try {
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        // @supabase/ssr 0.3.x API (installed version) — reads/writes cookies
        // via get/set/remove. Without these the middleware never sees the
        // session cookie written by createBrowserClient, so every protected
        // route redirects back to /auth/signin in an infinite loop.
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value)
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          request.cookies.set(name, '')
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set(name, '', { ...options, maxAge: 0 })
        },
        // Forward-compatible with @supabase/ssr >= 0.4 (getAll/setAll API)
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/progress', '/profile', '/curriculum/[slug]']
  const isProtected = protectedPaths.some((path) => {
    if (path.includes('[slug]')) {
      return (
        request.nextUrl.pathname.startsWith('/curriculum/') &&
        request.nextUrl.pathname !== '/curriculum'
      )
    }
    return request.nextUrl.pathname.startsWith(path)
  })

  // Auth routes
  const authPaths = ['/auth/signin', '/auth/signup']
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/signin'
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthPage && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/progress'
    return NextResponse.redirect(redirectUrl)
  }

  } catch {
    return supabaseResponse
  }
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|public|api).*)',
  ],
}
