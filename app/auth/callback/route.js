import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ''

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeErr) {
    // Code already used or expired — send to login with a clear message
    return NextResponse.redirect(`${origin}/login?error=link_expired`)
  }

  // Password reset — has an explicit next=/reset-password param
  if (next && next.startsWith('/')) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Email verification flow
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  // Check whether the profile already exists (e.g. already verified before)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?verified=1`)
  }

  // No profile yet — create it from user_metadata stored during signup
  const meta = user.user_metadata || {}
  const metaRole = meta.role

  if (metaRole) {
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: user.id,
      role: metaRole,
      full_name: meta.full_name || user.email?.split('@')[0] || 'User',
      phone: meta.phone || null,
      date_of_birth: meta.date_of_birth || null,
      sex: meta.sex || null,
      preferences: meta.preferences || null,
    }, { onConflict: 'id', ignoreDuplicates: false })

    if (profileErr) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=profile_failed`)
    }

    if (metaRole === 'mother') {
      await supabase.from('mothers').upsert({
        id: user.id,
        lmp_date: meta.lmp_date || null,
        due_date: meta.due_date || null,
        district: meta.district || null,
        sector: meta.sector || null,
        lat: meta.lat || null,
        lng: meta.lng || null,
      }, { onConflict: 'id', ignoreDuplicates: false })
    } else if (metaRole === 'chw') {
      const chwCode = meta.chw_code || `CHW-${user.id.substring(0, 8).toUpperCase()}`
      await supabase.from('chws').upsert({
        id: user.id,
        chw_code: chwCode,
        district: meta.chw_district || '',
        sector: meta.chw_sector || '',
        lat: meta.chw_lat || null,
        lng: meta.chw_lng || null,
        health_facility: meta.health_facility || null,
        years_experience: meta.years_experience ? parseInt(meta.years_experience) : null,
      }, { onConflict: 'id', ignoreDuplicates: false })
    }
  }

  // Always sign out after verification — user must log in explicitly
  await supabase.auth.signOut()
  return NextResponse.redirect(`${origin}/login?verified=1`)
}
