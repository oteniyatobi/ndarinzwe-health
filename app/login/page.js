'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthHeader from '@/components/AuthHeader'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30000 // 30 seconds

function friendlyError(error) {
  if (!error) return null
  const code = error.code || ''
  const msg = (error.message || '').toLowerCase()
  if (code === 'email_not_confirmed') {
    return 'Please verify your email first — check your inbox (and spam) for the confirmation link.'
  }
  if (code === 'invalid_credentials' || msg.includes('invalid login') || msg.includes('invalid_credentials')) {
    return 'Incorrect email or password. Please check and try again.'
  }
  if (code === 'over_request_rate_limit') return 'Too many attempts. Please wait 30 seconds and try again.'
  if (code === 'user_not_found') return 'No account found with that email address.'
  return 'Sign in failed. Please try again.'
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isVerified = searchParams.get('verified') === '1'
  const errorParam = searchParams.get('error')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [failCount, setFailCount] = useState(0)
  const [lockUntil, setLockUntil] = useState(null)
  const [lockRemaining, setLockRemaining] = useState(0)

  // Countdown timer when locked out
  useEffect(() => {
    if (!lockUntil) return
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockUntil(null)
        setLockRemaining(0)
        setFailCount(0)
        clearInterval(interval)
      } else {
        setLockRemaining(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockUntil])

  const isLocked = !!(lockUntil && Date.now() < lockUntil)

  async function handleSubmit(e) {
    e.preventDefault()
    if (isLocked) return

    setLoading(true)
    setError('')

    const formData = new FormData(e.target)
    const email = formData.get('email')?.toString().trim().toLowerCase()
    const password = formData.get('password')?.toString()

    if (!email || !password) {
      setError('Please enter your email and password.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      const newCount = failCount + 1
      setFailCount(newCount)
      if (newCount >= MAX_ATTEMPTS) {
        setLockUntil(Date.now() + LOCKOUT_MS)
        setError(`Too many failed attempts. Please wait 30 seconds before trying again.`)
      } else {
        const remaining = MAX_ATTEMPTS - newCount
        setError(`${friendlyError(signInError)}${remaining <= 2 ? ` (${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout)` : ''}`)
      }
      setLoading(false)
      return
    }

    // Successful login — reset lockout state
    setFailCount(0)
    setLockUntil(null)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      router.push('/signup?resume=1')
      router.refresh()
      return
    }

    router.push(profile.role === 'chw' ? '/dashboard/chw' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthHeader />

      <main className="flex-1 flex items-start justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-md">

          {/* Email verified banner */}
          {isVerified && (
            <div className="bg-green-50 border border-green-200 rounded-[8px] px-4 py-3 mb-6 flex items-start gap-3">
              <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="text-sm font-medium text-green-700">
                Email confirmed! Please log in to access your account.
              </p>
            </div>
          )}

          {/* Callback error banners */}
          {errorParam === 'link_expired' && (
            <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3 mb-6">
              <p className="text-sm font-medium text-amber-700">
                That verification link has expired or was already used. Please log in or sign up again.
              </p>
            </div>
          )}
          {errorParam === 'profile_failed' && (
            <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3 mb-6">
              <p className="text-sm font-medium text-red-700">
                Account was verified but profile setup failed. Please contact info@ndarinzwe.com.
              </p>
            </div>
          )}

          <h1 className="text-3xl font-bold text-navy mb-8">Welcome Back</h1>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5" htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" required autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-[5px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-navy" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs font-medium text-pink-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-[5px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                />
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {isLocked && (
              <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3">
                <p className="text-sm font-medium text-amber-700">
                  Account temporarily locked. Try again in <strong>{lockRemaining}s</strong>.
                </p>
              </div>
            )}

            <button type="submit" disabled={loading || isLocked}
              className="w-full py-3.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-60 mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : isLocked ? `Locked — wait ${lockRemaining}s` : 'Log in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-navy">
            New to Ndarinzwe?{' '}
            <Link href="/signup" className="font-bold underline underline-offset-2 hover:text-pink-primary transition-colors">Create Account</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
