'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

// ── In-memory rate limiter (per server instance) ──────────────
// Limits to 10 login attempts per IP per 15 minutes.
// For multi-instance production, replace with Upstash Redis.
const loginAttempts = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function isRateLimited(ip) {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  if (record.count >= MAX_ATTEMPTS) return true
  record.count++
  return false
}

// ── Supabase server client for actions ───────────────────────
async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          )
        },
      },
    }
  )
}

// ── signIn ────────────────────────────────────────────────────
// Returns: { error } on failure | { redirect } on success
export async function signIn(formData) {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    '127.0.0.1'

  if (isRateLimited(ip)) {
    return { error: 'Too many sign-in attempts. Please wait 15 minutes before trying again.' }
  }

  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'Please enter your email and password.' }
  }

  const supabase = await getSupabase()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const code = error.code || ''
    const msg = (error.message || '').toLowerCase()

    // email_not_confirmed treated identically to wrong credentials
    // — revealing "confirm your email" tells attacker the email exists
    if (
      code === 'invalid_credentials' ||
      code === 'email_not_confirmed' ||
      msg.includes('invalid login credentials')
    ) {
      return { error: 'Incorrect email or password.' }
    }
    if (code === 'over_request_rate_limit') {
      return { error: 'Too many attempts. Please wait 30 seconds.' }
    }
    return { error: 'Sign in failed. Please try again.' }
  }

  // Fetch role to redirect correctly
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return { error: 'Account setup is incomplete. Please sign up again or contact info@ndarinzwe.com.' }
  }

  return { redirect: profile.role === 'chw' ? '/dashboard/chw' : '/dashboard' }
}

// ── signOut ───────────────────────────────────────────────────
export async function signOut() {
  const supabase = await getSupabase()
  await supabase.auth.signOut()
  return { redirect: '/' }
}
