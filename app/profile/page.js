'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

function calcWeeks(lmpDate, dueDate) {
  if (lmpDate) {
    const days = Math.floor((Date.now() - new Date(lmpDate).getTime()) / 86400000)
    return Math.max(0, Math.min(40, Math.floor(days / 7)))
  }
  if (dueDate) {
    const rem = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    return Math.max(0, Math.min(40, Math.floor((280 - rem) / 7)))
  }
  return null
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-0 gap-6">
      <span className="text-sm font-bold text-navy/60 w-40 shrink-0">{label}</span>
      <span className="text-sm text-navy font-medium">{value || '—'}</span>
    </div>
  )
}

function BackBtn({ href }) {
  return (
    <Link href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back to Dashboard
    </Link>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [mother, setMother] = useState(null)
  const [chw, setChw] = useState(null)
  const [chwProfile, setChwProfile] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const [{ data: p }, { data: m }, { data: c }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('mothers').select('*, chws(id, profiles(full_name, phone))').eq('id', user.id).single(),
        supabase.from('chws').select('*').eq('id', user.id).single(),
      ])

      setProfile(p)
      setMother(m)
      setChw(c)
      if (m?.chws) setChwProfile(m.chws)

      if (p?.avatar_url) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(p.avatar_url)
        setAvatarUrl(publicUrl)
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setUploadError('Photo must be under 5MB.'); return }
    if (!file.type.startsWith('image/')) { setUploadError('Please choose an image file.'); return }

    setUploading(true); setUploadError('')
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { setUploadError('Upload failed. Please try again.'); setUploading(false); return }

    await supabase.from('profiles').update({ avatar_url: path }).eq('id', userId)
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl + '?t=' + Date.now())
    setProfile(p => ({ ...p, avatar_url: path }))
    setUploading(false)
  }

  if (loading) return <Loading />

  const isMother = profile?.role === 'mother'
  const isChw = profile?.role === 'chw'
  const dashHref = isChw ? '/dashboard/chw' : '/dashboard'
  const weeks = isMother ? calcWeeks(mother?.lmp_date, mother?.due_date) : null
  const pct = weeks !== null ? Math.min(100, Math.round((weeks / 40) * 100)) : 0
  const initials = (profile?.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-10">
        <BackBtn href={dashHref} />

        {/* Avatar + name */}
        <div className="flex items-center gap-6 mb-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-navy/10 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
              {avatarUrl
                ? <img src={avatarUrl} alt="Profile photo" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-navy">{initials}</span>
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed">
              {uploading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span className="text-xs font-bold text-white">Change</span>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-navy mb-1">{profile?.full_name || '—'}</h1>
            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${isMother ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
              {isMother ? 'Mother' : 'Community Health Worker'}
            </span>
            {uploadError && <p className="mt-2 text-xs font-medium text-red-500">{uploadError}</p>}
            <p className="mt-2 text-xs text-gray-400">Click your photo to change it (max 5MB)</p>
          </div>
        </div>

        {/* Pregnancy progress bar for mothers */}
        {isMother && weeks !== null && (
          <div className="mb-8 p-5 border border-gray-200 rounded-[10px]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-navy">Pregnancy Progress</p>
              <p className="text-sm font-medium text-gray-400">Week {weeks} of 40</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="h-2 bg-navy rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-gray-400">{pct}% — Due {fmtDate(mother?.due_date)}</p>
          </div>
        )}

        {/* Personal info */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-navy">Personal Information</h2>
            <Link href="/dashboard/settings" className="text-xs font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
              Edit
            </Link>
          </div>
          <div className="border border-gray-100 rounded-[10px] px-5">
            <InfoRow label="Full Name" value={profile?.full_name} />
            <InfoRow label="Sex" value={profile?.sex} />
            <InfoRow label="Date of Birth" value={fmtDate(profile?.date_of_birth)} />
            <InfoRow label="Phone" value={profile?.phone} />
          </div>
        </section>

        {/* Mother-specific info */}
        {isMother && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-navy">Pregnancy Details</h2>
            </div>
            <div className="border border-gray-100 rounded-[10px] px-5">
              <InfoRow label="Due Date" value={fmtDate(mother?.due_date)} />
              <InfoRow label="LMP Date" value={fmtDate(mother?.lmp_date)} />
              <InfoRow label="District" value={mother?.district} />
              <InfoRow label="Sector" value={mother?.sector} />
              <InfoRow label="Village" value={mother?.village} />
            </div>
          </section>
        )}

        {/* CHW-specific info */}
        {isChw && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-navy">CHW Details</h2>
            </div>
            <div className="border border-gray-100 rounded-[10px] px-5">
              <InfoRow label="CHW Code" value={chw?.chw_code} />
              <InfoRow label="Health Facility" value={chw?.health_facility} />
              <InfoRow label="District" value={chw?.district} />
              <InfoRow label="Sector" value={chw?.sector} />
              <InfoRow label="Years Experience" value={chw?.years_experience ? `${chw.years_experience} years` : null} />
            </div>
          </section>
        )}

        {/* Linked CHW for mothers */}
        {isMother && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-navy">My Care Team</h2>
              <Link href="/dashboard/find-chw" className="text-xs font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
                {mother?.linked_chw_id ? 'Change CHW' : 'Find a CHW'}
              </Link>
            </div>
            <div className="border border-gray-100 rounded-[10px] px-5">
              {chwProfile ? (
                <>
                  <InfoRow label="CHW Name" value={chwProfile.profiles?.full_name} />
                  <InfoRow label="CHW Phone" value={chwProfile.profiles?.phone} />
                  <InfoRow label="Sector" value={chw?.sector ? `${chw.sector}, ${chw.district}` : null} />
                </>
              ) : (
                <div className="py-4">
                  <p className="text-sm text-gray-400">No CHW linked yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Account actions */}
        <section>
          <h2 className="text-base font-bold text-navy mb-3">Account</h2>
          <div className="border border-gray-100 rounded-[10px] px-5">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-navy/60">Settings</span>
              <Link href="/dashboard/settings" className="text-xs font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
                Open
              </Link>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-navy/60">Password</span>
              <Link href="/forgot-password" className="text-xs font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
                Change
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-400">Loading profile…</p>
      </div>
    </div>
  )
}
