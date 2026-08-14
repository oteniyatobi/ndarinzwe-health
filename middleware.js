import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/journey', '/profile']

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not remove — refreshes expired tokens on every request
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r))

  // Unauthenticated user hitting a protected route → login
  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based protection: /dashboard/chw is CHW-only
  if (user && path.startsWith('/dashboard/chw')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'chw') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
}
