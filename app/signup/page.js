'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthHeader from '@/components/AuthHeader'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { DISTRICTS, getSectors } from '@/lib/rwanda-locations'

/* ── Pregnancy helpers ───────────────────────────────────────── */
function calcDueDate(lmpStr) {
  if (!lmpStr) return null
  return new Date(new Date(lmpStr).getTime() + 280 * 86400000).toISOString().split('T')[0]
}
function calcWeeks(lmpStr) {
  if (!lmpStr) return null
  return Math.max(0, Math.floor((Date.now() - new Date(lmpStr).getTime()) / 604800000))
}
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ── Password strength ───────────────────────────────────────── */
function validatePassword(pwd) {
  if (!pwd) return 'Password is required'
  if (pwd.length < 8) return 'Must be at least 8 characters'
  if (!/[a-zA-Z]/.test(pwd)) return 'Must include at least one letter'
  if (!/[0-9]/.test(pwd)) return 'Must include at least one number'
  if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Must include at least one special character (e.g. !@#$%^&*)'
  return null
}
function pwdStrength(pwd) {
  if (!pwd) return 0
  let s = 0
  if (pwd.length >= 8) s++
  if (/[a-zA-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^a-zA-Z0-9]/.test(pwd)) s++
  return s
}

/* ── Auth error mapping ──────────────────────────────────────── */
function friendlyError(error) {
  if (!error) return null
  const code = error.code || ''
  const msg = (error.message || '').toLowerCase()
  if (code === 'user_already_exists' || code === 'email_exists') return 'ACCOUNT_EXISTS'
  if (code === 'weak_password') return 'Password is too weak. Use at least 8 characters with letters, numbers, and a special character.'
  if (code === 'over_email_send_rate_limit') return 'Too many emails sent. Please wait a few minutes and try again.'
  if (code === 'over_request_rate_limit') return 'Too many attempts. Please wait 30 seconds.'
  if (code === 'email_address_invalid') return 'Please enter a valid email address.'
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) return 'Incorrect email or password.'
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('fetch')) {
    return 'Cannot reach the server. Check your internet connection — if the problem continues, the service may be temporarily down.'
  }
  return error.message || 'Something went wrong. Please try again.'
}

/* ── Preference lists (from Figma) ──────────────────────────── */
const MOTHER_PREFS = [
  'Pregnancy Reminders', 'Nutrition Guidance', 'Baby Development',
  'Health Education', 'Vaccination Care', 'Postpartum Care',
]
const CHW_PREFS = [
  'Mother Tracking', 'Visit Scheduling', 'ANC Follow-ups',
  'Health Reporting', 'Educational Resources', 'Notifications & Reminders',
]

/* ── Styles ──────────────────────────────────────────────────── */
const inputCls = 'w-full px-4 py-3 border border-gray-300 rounded-[5px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent'
const inputErrCls = 'w-full px-4 py-3 border border-red-400 rounded-[5px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent'
const btnPrimary = 'flex-1 py-3.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
const btnSecondary = 'flex-1 py-3.5 border border-gray-300 text-sm font-bold text-navy rounded-[5px] hover:bg-gray-50 transition-colors'

function Field({ label, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <label className="block text-sm font-medium text-navy">{label}</label>
        {hint && <span className="text-xs font-medium text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}

function ErrorBanner({ message, isAccountExists, onLogin }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-[8px] px-4 py-3">
      <p className="text-sm font-medium text-red-700">
        {message}
        {isAccountExists && (
          <>{' '}<button type="button" onClick={onLogin} className="font-bold underline underline-offset-2">Log in instead →</button></>
        )}
      </p>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────── */
function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isResume = searchParams.get('resume') === '1'

  const TOTAL_STEPS = 5
  const [step, setStep] = useState(isResume ? 2 : 1)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [resumeUser, setResumeUser] = useState(null)
  const [apiError, setApiError] = useState('')
  const [isAccountExists, setIsAccountExists] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [preferences, setPreferences] = useState([])

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    dob: '', sex: '', phone: '',
    agreedTerms: false, agreedHealth: false,
    // Mother
    dueDateMode: 'lmp', lmpDate: '', knownDueDate: '',
    firstPregnancy: '', pregnancyCount: '',
    district: '', sector: '', lat: null, lng: null,
    // CHW
    healthFacility: '', chwCode: '',
    chwDistrict: '', chwSector: '', chwLat: null, chwLng: null,
    supportsMothers: '', yearsExperience: '',
  })

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  useEffect(() => {
    if (!isResume) return
    async function loadSession() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setResumeUser(user)
      const meta = user.user_metadata || {}
      if (meta.full_name) {
        const parts = meta.full_name.split(' ')
        setForm(f => ({ ...f, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' }))
      }
      if (meta.preferences) setPreferences(meta.preferences)
      if (meta.role) setRole(meta.role)
    }
    loadSession()
  }, [isResume, router])

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [key]: val }))
    if (fieldErrors[key]) setFieldErrors(fe => ({ ...fe, [key]: '' }))
  }

  const togglePref = (pref) =>
    setPreferences(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref])

  const calculatedDueDate = form.dueDateMode === 'lmp'
    ? calcDueDate(form.lmpDate) : form.knownDueDate || null
  const weeks = form.dueDateMode === 'lmp' && form.lmpDate ? calcWeeks(form.lmpDate) : null

  function showErr(msg, accountExists = false) {
    setApiError(msg); setIsAccountExists(accountExists); setLoading(false)
  }

  /* ── Step 1 validation ─────────────────────────────────────── */
  function handleStep1() {
    const errors = {}
    if (!form.firstName.trim()) errors.firstName = 'First name is required'
    if (!form.lastName.trim()) errors.lastName = 'Last name is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address'
    const pwdErr = validatePassword(form.password)
    if (pwdErr) errors.password = pwdErr
    if (!form.dob) errors.dob = 'Date of birth is required'
    if (!form.sex) errors.sex = 'Please select your sex'
    if (!form.agreedTerms) errors.agreedTerms = 'You must agree to the Terms of Service'
    if (!form.agreedHealth) errors.agreedHealth = 'You must consent to health data collection'
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setFieldErrors({})
    setStep(2)
  }

  /* ── Step 3 validation ─────────────────────────────────────── */
  function handleStep3() {
    const errors = {}
    if (role === 'mother') {
      if (!calculatedDueDate) errors.dueDate = 'Please enter your LMP date or due date'
      if (!form.district.trim()) errors.district = 'District is required'
      if (!form.sector.trim()) errors.sector = 'Sector is required'
    } else {
      if (!form.healthFacility.trim()) errors.healthFacility = 'Health facility name is required'
      if (!form.chwDistrict.trim()) errors.chwDistrict = 'District is required'
      if (!form.chwSector.trim()) errors.chwSector = 'Sector is required'
    }
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setFieldErrors({})
    setStep(4)
  }

  function getLocation(latKey, lngKey) {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setForm(f => ({ ...f, [latKey]: coords.latitude, [lngKey]: coords.longitude })),
      () => setApiError('Could not get your location. Enter district and sector manually.')
    )
  }

  /* ── Final submit (step 5) ─────────────────────────────────── */
  async function handleSubmit() {
    setLoading(true)
    setApiError('')
    setIsAccountExists(false)
    let supabase
    try {
      supabase = createClient()
    } catch (err) {
      showErr(err.message || 'Authentication service is not configured. Please contact support.')
      return
    }

    let uid

    if (isResume && resumeUser) {
      uid = resumeUser.id
    } else {
      const email = form.email.trim().toLowerCase()
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName, role, sex: form.sex,
            phone: form.phone || null, date_of_birth: form.dob || null,
            preferences,
            lmp_date: role === 'mother' ? (form.lmpDate || null) : null,
            due_date: role === 'mother' ? (calculatedDueDate || null) : null,
            district: role === 'mother' ? form.district : null,
            sector: role === 'mother' ? form.sector : null,
            lat: role === 'mother' ? (form.lat || null) : null,
            lng: role === 'mother' ? (form.lng || null) : null,
            first_pregnancy: role === 'mother' ? form.firstPregnancy : null,
            pregnancy_count: role === 'mother' ? form.pregnancyCount : null,
            health_facility: role === 'chw' ? form.healthFacility : null,
            chw_code: role === 'chw' ? form.chwCode : null,
            chw_district: role === 'chw' ? form.chwDistrict : null,
            chw_sector: role === 'chw' ? form.chwSector : null,
            chw_lat: role === 'chw' ? (form.chwLat || null) : null,
            chw_lng: role === 'chw' ? (form.chwLng || null) : null,
            supports_mothers: role === 'chw' ? form.supportsMothers : null,
            years_experience: role === 'chw' ? form.yearsExperience : null,
          },
        },
      })

      if (signUpErr) {
        const friendly = friendlyError(signUpErr)
        return showErr(
          friendly === 'ACCOUNT_EXISTS' ? 'An account with this email already exists.' : (friendly || signUpErr.message),
          friendly === 'ACCOUNT_EXISTS'
        )
      }

      if (signUpData.user?.identities?.length === 0) return showErr('An account with this email already exists.', true)

      if (!signUpData.session) {
        // Email confirmation required — profile will be auto-created in /auth/callback
        setLoading(false)
        setDone(true)
        return
      }

      uid = signUpData.user.id

      const { data: existingProfile } = await supabase.from('profiles').select('role').eq('id', uid).single()
      if (existingProfile) {
        router.push(existingProfile.role === 'chw' ? '/dashboard/chw' : '/dashboard')
        router.refresh()
        return
      }
    }

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()
      || resumeUser?.user_metadata?.full_name
      || resumeUser?.email?.split('@')[0] || 'User'

    const { error: profileErr } = await supabase.from('profiles').upsert(
      { id: uid, role, full_name: fullName, phone: form.phone.trim() || null, date_of_birth: form.dob || null, sex: form.sex || null, preferences: preferences.length > 0 ? preferences : null },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    if (profileErr) return showErr('Profile save failed. Please contact info@ndarinzwe.com.')

    if (role === 'mother') {
      await supabase.from('mothers').upsert(
        { id: uid, lmp_date: form.lmpDate || null, due_date: calculatedDueDate, district: form.district.trim() || null, sector: form.sector.trim() || null, lat: form.lat, lng: form.lng },
        { onConflict: 'id', ignoreDuplicates: true }
      )
      router.push('/dashboard')
      router.refresh()
    } else {
      const chwCode = form.chwCode.trim() || `CHW-${uid.substring(0, 8).toUpperCase()}`
      const { error: chwErr } = await supabase.from('chws').upsert(
        { id: uid, chw_code: chwCode, district: form.chwDistrict.trim(), sector: form.chwSector.trim(), lat: form.chwLat, lng: form.chwLng, health_facility: form.healthFacility.trim() || null, years_experience: form.yearsExperience ? parseInt(form.yearsExperience) : null },
        { onConflict: 'id', ignoreDuplicates: true }
      )
      if (chwErr?.code === '23505' || chwErr?.message?.includes('unique')) {
        return showErr('That CHW code is already in use. Please contact your health centre.')
      }
      router.push('/dashboard/chw')
      router.refresh()
    }
  }

  /* ── "Check your email" screen ──────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AuthHeader />
        <main className="flex-1 flex items-start justify-center px-6 py-16 md:py-24">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy mb-3">Check your email</h1>
            <p className="text-sm font-medium text-black/60 leading-relaxed mb-6">
              We sent a confirmation link to <strong>{form.email}</strong>.
              Click it — you'll be prompted to log in and land straight on your dashboard.
            </p>
            <p className="text-xs font-medium text-black/40">
              Didn't get it? Check your spam folder or{' '}
              <button type="button" onClick={() => setDone(false)} className="underline hover:text-navy transition-colors">go back</button>.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Progress bar ────────────────────────────────────────────── */
  const progressPct = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthHeader />

      <main className="flex-1 flex items-start justify-center px-6 py-12 md:py-20">
        <div className="w-full max-w-md">

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-400">Step {step} of {TOTAL_STEPS}</p>
              <p className="text-xs font-medium text-gray-400">{progressPct}%</p>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-navy rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* ── Step 1: Account ────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <h1 className="text-3xl font-bold text-navy">Create Account</h1>

              <div className="grid grid-cols-2 gap-4">
                <Field label="First Legal Name" error={fieldErrors.firstName}>
                  <input type="text" value={form.firstName} onChange={set('firstName')}
                    autoComplete="given-name" className={fieldErrors.firstName ? inputErrCls : inputCls} />
                </Field>
                <Field label="Second Legal Name" error={fieldErrors.lastName}>
                  <input type="text" value={form.lastName} onChange={set('lastName')}
                    autoComplete="family-name" className={fieldErrors.lastName ? inputErrCls : inputCls} />
                </Field>
              </div>

              <Field label="Email" error={fieldErrors.email}>
                <input type="email" value={form.email} onChange={set('email')}
                  autoComplete="email" className={fieldErrors.email ? inputErrCls : inputCls} />
              </Field>

              <Field label="Password" error={fieldErrors.password}>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={set('password')}
                    placeholder="Min 8 chars · letter · number · symbol"
                    autoComplete="new-password"
                    className={`${fieldErrors.password ? inputErrCls : inputCls} pr-11`}
                  />
                  <button type="button" onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {form.password.length > 0 && !fieldErrors.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => {
                        const s = pwdStrength(form.password)
                        const col = s >= 4 ? 'bg-green-500' : s === 3 ? 'bg-yellow-400' : s === 2 ? 'bg-orange-400' : 'bg-red-400'
                        return <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= s ? col : 'bg-gray-200'}`} />
                      })}
                    </div>
                    <p className="text-xs font-medium text-gray-400">
                      {pwdStrength(form.password) === 4 ? '✓ Strong password' :
                       pwdStrength(form.password) === 3 ? 'Good — add a special character (!@#$%)' :
                       pwdStrength(form.password) === 2 ? 'Fair — also need numbers and symbols' :
                       'Weak — needs letters, numbers, and a symbol'}
                    </p>
                  </div>
                )}
              </Field>

              <Field label="Date of Birth" error={fieldErrors.dob}>
                <input type="date" value={form.dob} onChange={set('dob')}
                  max={new Date().toISOString().split('T')[0]}
                  autoComplete="bday" className={fieldErrors.dob ? inputErrCls : inputCls} />
              </Field>

              <Field label="Sex" error={fieldErrors.sex}>
                <div className="flex gap-4">
                  {['Male', 'Female'].map(s => (
                    <label key={s} className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-[5px] cursor-pointer transition-colors text-sm font-medium ${form.sex === s ? 'border-navy bg-navy/5 text-navy' : 'border-gray-300 text-black/60 hover:border-navy/40'}`}>
                      <input type="radio" name="sex" value={s} checked={form.sex === s} onChange={set('sex')} className="sr-only" />
                      {s}
                    </label>
                  ))}
                </div>
              </Field>

              {/* Consent checkboxes */}
              <div className="space-y-3 pt-1 border-t border-gray-100">
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.agreedTerms} onChange={set('agreedTerms')}
                      className="mt-0.5 w-4 h-4 accent-navy flex-shrink-0" />
                    <span className="text-sm font-medium text-black/70 leading-relaxed">
                      I have read and agree to Ndarinzwe's{' '}
                      <Link href="/terms" className="text-navy underline">Terms of Service</Link>{' '}and{' '}
                      <Link href="/privacy" className="text-navy underline">Privacy Policy</Link>.
                    </span>
                  </label>
                  {fieldErrors.agreedTerms && <p className="text-xs font-medium text-red-500 mt-1 ml-7">{fieldErrors.agreedTerms}</p>}
                </div>
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.agreedHealth} onChange={set('agreedHealth')}
                      className="mt-0.5 w-4 h-4 accent-navy flex-shrink-0" />
                    <span className="text-sm font-medium text-black/70 leading-relaxed">
                      I consent to Ndarinzwe collecting and using my personal and health information.
                    </span>
                  </label>
                  {fieldErrors.agreedHealth && <p className="text-xs font-medium text-red-500 mt-1 ml-7">{fieldErrors.agreedHealth}</p>}
                </div>
              </div>

              <button type="button" onClick={handleStep1} className={`${btnPrimary} w-full mt-2`}>
                Continue
              </button>

              <p className="text-center text-sm font-medium text-navy">
                Already have an account?{' '}
                <Link href="/login" className="font-bold underline underline-offset-2 hover:text-pink-primary transition-colors">Log in</Link>
              </p>
            </div>
          )}

          {/* ── Step 2: Role ───────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">Choose Your Role</h1>
              <p className="text-sm font-medium text-black/60 mb-8">How will you use Ndarinzwe?</p>

              <div className="space-y-4 mb-8">
                {[
                  { value: 'mother', label: 'Mother', desc: 'I am pregnant or recently gave birth and want to track my pregnancy and connect with a Community Health Worker.', icon: <MotherIcon /> },
                  { value: 'chw', label: 'Community Health Worker', desc: 'I am an Inshuti Mu Buzima supporting mothers in my sector with antenatal and postnatal care.', icon: <CHWIcon /> },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                    className={`w-full text-left border rounded-[10px] p-5 flex items-start gap-4 transition-all ${role === opt.value ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-navy/40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${role === opt.value ? 'bg-navy text-white' : 'bg-gray-100 text-navy'}`}>
                      {opt.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy mb-1">{opt.label}</p>
                      <p className="text-sm font-medium text-black/60 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {!role && <p className="text-xs font-medium text-gray-400 mb-4 text-center">Please select a role to continue</p>}

              <div className="flex gap-3">
                {!isResume && <button type="button" onClick={() => setStep(1)} className={btnSecondary}>Back</button>}
                <button type="button" onClick={() => role && setStep(3)} disabled={!role} className={btnPrimary}>Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 3a: Mother pregnancy details ─────────────────── */}
          {step === 3 && role === 'mother' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-navy mb-2">Tell Us About Your Pregnancy</h1>
                <p className="text-sm font-medium text-black/60">Personalises your reminders and connects you with a nearby CHW.</p>
              </div>

              <Field label="Phone Number" hint="optional">
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+250 7XX XXX XXX" autoComplete="tel" className={inputCls} />
              </Field>

              {/* Due date */}
              <div>
                <p className="text-sm font-medium text-navy mb-3">What is your expected due date?</p>
                <div className="space-y-2 mb-4">
                  {[
                    { value: 'lmp', label: 'Calculate from my last menstrual period' },
                    { value: 'known', label: 'I know my due date' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="radio" name="dueDateMode" value={opt.value}
                        checked={form.dueDateMode === opt.value} onChange={set('dueDateMode')} className="w-4 h-4 accent-navy" />
                      <span className="text-sm font-medium text-black">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {form.dueDateMode === 'lmp' && (
                  <Field label="First day of your last menstrual period" error={fieldErrors.dueDate}>
                    <input type="date" value={form.lmpDate} onChange={set('lmpDate')}
                      max={new Date().toISOString().split('T')[0]} className={fieldErrors.dueDate ? inputErrCls : inputCls} />
                    {calculatedDueDate && (
                      <div className="mt-3 bg-pink-primary/10 rounded-[8px] px-4 py-3">
                        <p className="text-sm font-bold text-navy">Estimated due date: {formatDate(calculatedDueDate)}</p>
                        {weeks !== null && <p className="text-xs font-medium text-black/60 mt-1">Approximately <strong>{weeks} weeks</strong> pregnant.</p>}
                      </div>
                    )}
                  </Field>
                )}

                {form.dueDateMode === 'known' && (
                  <Field label="Your due date" error={fieldErrors.dueDate}>
                    <input type="date" value={form.knownDueDate} onChange={set('knownDueDate')} className={fieldErrors.dueDate ? inputErrCls : inputCls} />
                  </Field>
                )}
              </div>

              {/* First pregnancy */}
              <div>
                <p className="text-sm font-medium text-navy mb-3">Is this your first pregnancy?</p>
                <div className="flex gap-4">
                  {['Yes', 'No'].map(v => (
                    <label key={v} className={`flex-1 flex items-center justify-center py-3 border rounded-[5px] cursor-pointer text-sm font-medium transition-colors ${form.firstPregnancy === v ? 'border-navy bg-navy/5 text-navy' : 'border-gray-300 text-black/60 hover:border-navy/40'}`}>
                      <input type="radio" name="firstPregnancy" value={v} checked={form.firstPregnancy === v} onChange={set('firstPregnancy')} className="sr-only" />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              {form.firstPregnancy === 'No' && (
                <Field label="How many pregnancies have you had?">
                  <input type="number" min="1" max="20" value={form.pregnancyCount} onChange={set('pregnancyCount')} placeholder="e.g. 2" className={inputCls} />
                </Field>
              )}

              {/* Location — district and sector REQUIRED */}
              <div>
                <p className="text-sm font-medium text-navy mb-1">Your location</p>
                <p className="text-xs font-medium text-amber-600 mb-3">District and sector are required — they help us find a CHW near you.</p>
                <button type="button" onClick={() => getLocation('lat', 'lng')}
                  className={`w-full flex items-center justify-center gap-2 py-3 border rounded-[5px] text-sm font-medium transition-colors mb-3 ${form.lat ? 'border-navy bg-navy/5 text-navy' : 'border-gray-300 text-navy hover:border-navy/40'}`}>
                  <LocationIcon />
                  {form.lat ? '✓ GPS location captured' : 'Use my current location (optional)'}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="District *" error={fieldErrors.district}>
                    <select value={form.district}
                      onChange={e => { set('district')(e); setForm(f => ({ ...f, sector: '' })) }}
                      className={fieldErrors.district ? inputErrCls : inputCls}>
                      <option value="">Select district…</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Sector *" error={fieldErrors.sector}>
                    <select value={form.sector} onChange={set('sector')}
                      disabled={!form.district}
                      className={fieldErrors.sector ? inputErrCls : inputCls}>
                      <option value="">{form.district ? 'Select sector…' : 'Choose district first'}</option>
                      {getSectors(form.district).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              <ErrorBanner message={apiError} isAccountExists={isAccountExists} onLogin={() => router.push('/login')} />

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className={btnSecondary}>Back</button>
                <button type="button" onClick={handleStep3} className={btnPrimary}>Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 3b: CHW details ───────────────────────────────── */}
          {step === 3 && role === 'chw' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-navy mb-2">Tell Us About Your Role</h1>
                <p className="text-sm font-medium text-black/60">Enter your details as registered with your sector health post.</p>
              </div>

              <Field label="Phone Number" hint="optional">
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+250 7XX XXX XXX" autoComplete="tel" className={inputCls} />
              </Field>

              <Field label="Which health facility do you work with?" error={fieldErrors.healthFacility}>
                <input type="text" value={form.healthFacility} onChange={set('healthFacility')} placeholder="e.g. Kacyiru Health Centre"
                  className={fieldErrors.healthFacility ? inputErrCls : inputCls} />
              </Field>

              <Field label="CHW Code" hint="optional — assigned by your health centre">
                <input type="text" value={form.chwCode} onChange={set('chwCode')} placeholder="e.g. RW-CHW-00123" className={inputCls} />
              </Field>

              <div>
                <p className="text-sm font-medium text-navy mb-1">Which district or sector do you serve? *</p>
                <p className="text-xs font-medium text-amber-600 mb-3">Required — mothers in your area will be matched to you.</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="District *" error={fieldErrors.chwDistrict}>
                    <select value={form.chwDistrict}
                      onChange={e => { set('chwDistrict')(e); setForm(f => ({ ...f, chwSector: '' })) }}
                      className={fieldErrors.chwDistrict ? inputErrCls : inputCls}>
                      <option value="">Select district…</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Sector *" error={fieldErrors.chwSector}>
                    <select value={form.chwSector} onChange={set('chwSector')}
                      disabled={!form.chwDistrict}
                      className={fieldErrors.chwSector ? inputErrCls : inputCls}>
                      <option value="">{form.chwDistrict ? 'Select sector…' : 'Choose district first'}</option>
                      {getSectors(form.chwDistrict).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-navy mb-3">Do you currently support pregnant mothers?</p>
                <div className="flex gap-4">
                  {['Yes', 'No'].map(v => (
                    <label key={v} className={`flex-1 flex items-center justify-center py-3 border rounded-[5px] cursor-pointer text-sm font-medium transition-colors ${form.supportsMothers === v ? 'border-navy bg-navy/5 text-navy' : 'border-gray-300 text-black/60 hover:border-navy/40'}`}>
                      <input type="radio" name="supportsMothers" value={v} checked={form.supportsMothers === v} onChange={set('supportsMothers')} className="sr-only" />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              <Field label="How many years of experience do you have?" hint="optional">
                <input type="number" min="0" max="50" value={form.yearsExperience} onChange={set('yearsExperience')} placeholder="e.g. 4" className={inputCls} />
              </Field>

              <button type="button" onClick={() => getLocation('chwLat', 'chwLng')}
                className={`w-full flex items-center justify-center gap-2 py-3 border rounded-[5px] text-sm font-medium transition-colors ${form.chwLat ? 'border-navy bg-navy/5 text-navy' : 'border-gray-300 text-navy hover:border-navy/40'}`}>
                <LocationIcon />
                {form.chwLat ? '✓ Location saved — mothers can find you' : 'Set my location (optional)'}
              </button>

              <ErrorBanner message={apiError} isAccountExists={isAccountExists} onLogin={() => router.push('/login')} />

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className={btnSecondary}>Back</button>
                <button type="button" onClick={handleStep3} className={btnPrimary}>Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 4: Preferences ────────────────────────────────── */}
          {step === 4 && (
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">
                {role === 'mother' ? 'Choose The Support You Need' : 'Customize Your Workspace'}
              </h1>
              <p className="text-sm font-medium text-black/60 mb-6">Options (Multi-Select)</p>

              <div className="space-y-3 mb-8">
                {(role === 'mother' ? MOTHER_PREFS : CHW_PREFS).map(pref => (
                  <button key={pref} type="button" onClick={() => togglePref(pref)}
                    className={`w-full py-4 px-5 border rounded-[5px] text-sm font-medium text-center transition-all ${preferences.includes(pref) ? 'border-navy bg-navy text-white' : 'border-gray-200 text-navy hover:border-navy/40 hover:bg-navy/5'}`}>
                    {pref}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className={btnSecondary}>Back</button>
                <button type="button" onClick={() => setStep(5)} className={btnPrimary}>Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 5: Profile Summary ─────────────────────────────── */}
          {step === 5 && (
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">
                {role === 'mother' ? "You're Ready To Get Started" : "You're Ready To Support Mothers"}
              </h1>
              <p className="text-sm font-medium text-black/60 mb-6">Profile Summary</p>

              <div className="space-y-3 mb-8">
                {[
                  `${form.firstName} ${form.lastName}`.trim() || resumeUser?.user_metadata?.full_name || '—',
                  ...(role === 'mother' ? [
                    calculatedDueDate ? formatDate(calculatedDueDate) : '—',
                    weeks !== null ? `${weeks} Weeks Pregnant` : null,
                    form.district ? `${form.district}${form.sector ? ', ' + form.sector : ''}` : null,
                  ] : [
                    form.healthFacility || '—',
                    form.chwDistrict ? `${form.chwDistrict} District` : null,
                    form.yearsExperience ? `${form.yearsExperience} Years Experience` : null,
                  ]),
                  preferences.length > 0 ? preferences.join(', ') : 'No preferences selected',
                ].filter(Boolean).map((val, i) => (
                  <div key={i} className="w-full px-5 py-4 border border-gray-200 rounded-[5px] text-sm font-medium text-black/60 bg-gray-50">
                    {val}
                  </div>
                ))}
              </div>

              <ErrorBanner message={apiError} isAccountExists={isAccountExists} onLogin={() => router.push('/login')} />

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(4)} className={btnSecondary}>Back</button>
                <button type="button" onClick={handleSubmit} disabled={loading} className={btnPrimary}>
                  {loading ? <Spinner label="Setting up your account…" /> : 'Go To Dashboard'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}

/* ── Icons ───────────────────────────────────────────────────── */
function Spinner({ label = 'Creating account…' }) {
  return (
    <>
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label}
    </>
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
function MotherIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="3" />
      <path d="M9 13c0-1.7.9-3.5 3-3.5s3 1.8 3 4.5c0 3-1.3 6.5-3 6.5S9 17 9 13z" />
    </svg>
  )
}
function CHWIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

export default function SignUpPageWrapper() {
  return <Suspense><SignUpPage /></Suspense>
}
