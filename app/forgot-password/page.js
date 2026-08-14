'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthHeader from '@/components/AuthHeader'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    const supabase = createClient()

    // redirectTo must be an absolute URL — Supabase sends user here after clicking email link.
    // The auth callback exchanges the code then redirects to /reset-password.
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo })

    if (resetError) {
      // Don't reveal whether the email exists — always show success to prevent enumeration.
      // Only show an error for rate limiting.
      if (resetError.message?.toLowerCase().includes('rate')) {
        setError('Too many requests. Please wait a few minutes before trying again.')
        setLoading(false)
        return
      }
    }

    // Always show the "check your email" screen regardless of whether the email exists.
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthHeader />

      <main className="flex-1 flex items-start justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-md">

          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-navy mb-3">Check your email</h1>
              <p className="text-sm font-medium text-black/60 leading-relaxed mb-6">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <p className="text-sm font-medium text-black/50 mb-8">
                The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity"
              >
                Back to Log in
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-navy transition-colors mb-8">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Log in
              </Link>

              <h1 className="text-3xl font-bold text-navy mb-2">Forgot your password?</h1>
              <p className="text-sm font-medium text-black/60 mb-8">
                Enter the email address linked to your account and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-[5px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Sending…
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
