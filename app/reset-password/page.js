'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthHeader from '@/components/AuthHeader'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function validatePassword(pwd) {
    if (!pwd) return 'Password is required'
    if (pwd.length < 8) return 'Must be at least 8 characters'
    if (!/[a-zA-Z]/.test(pwd)) return 'Must include at least one letter'
    if (!/[0-9]/.test(pwd)) return 'Must include at least one number'
    if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Must include at least one special character (e.g. !@#$%^&*)'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const pwdErr = validatePassword(password)
    if (pwdErr) { setError(pwdErr); return }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      if (updateError.message?.toLowerCase().includes('same password')) {
        setError('Your new password must be different from your current password.')
      } else if (updateError.message?.toLowerCase().includes('session')) {
        setError('Your reset link has expired. Please request a new one.')
      } else {
        setError('Failed to update password. Please try again or request a new reset link.')
      }
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    // Redirect to login after 3 seconds
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthHeader />

      <main className="flex-1 flex items-start justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-md">

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-navy mb-3">Password updated</h1>
              <p className="text-sm font-medium text-black/60 mb-6">
                Your password has been changed successfully. Redirecting you to log in…
              </p>
              <Link href="/login" className="inline-block px-6 py-3 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity">
                Log in now
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-navy mb-2">Set a new password</h1>
              <p className="text-sm font-medium text-black/60 mb-8">
                Choose a strong password for your Ndarinzwe account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5" htmlFor="password">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      placeholder="Min 8 chars · letter · number · symbol"
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-[5px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {password.length > 0 && password.length < 8 && (
                    <p className="mt-1.5 text-xs font-medium text-amber-500">
                      {8 - password.length} more character{8 - password.length !== 1 ? 's' : ''} needed
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5" htmlFor="confirm">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError('') }}
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 border rounded-[5px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                      confirm && confirm !== password
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-navy'
                    }`}
                  />
                  {confirm && confirm !== password && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                    {error.includes('expired') && (
                      <Link href="/forgot-password" className="text-sm font-bold text-red-700 underline underline-offset-2 mt-1 block">
                        Request a new link →
                      </Link>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || password !== confirm}
                  className="w-full py-3.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Updating…
                    </>
                  ) : 'Update Password'}
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

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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
