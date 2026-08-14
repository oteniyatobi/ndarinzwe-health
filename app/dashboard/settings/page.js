'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const NAV = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'security', label: 'Log In & Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'permission', label: 'Permission' },
  { id: 'privacy', label: 'Privacy & Data' },
  { id: 'preferences', label: 'Preferences' },
]

function SettingRow({ label, value, onSave, saving, editContent }) {
  const [editing, setEditing] = useState(false)
  const hasValue = value && value !== 'Not provided'

  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-navy mb-1">{label}</p>
          {!editing && (
            <p className="text-sm text-gray-500">{value || 'Not provided'}</p>
          )}
        </div>
        <button
          onClick={() => setEditing(v => !v)}
          className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors shrink-0"
        >
          {editing ? 'Cancel' : hasValue ? 'Edit' : 'Add'}
        </button>
      </div>

      {editing && (
        <div className="mt-4">
          {editContent}
          {onSave && (
            <button
              onClick={async () => { await onSave(); setEditing(false) }}
              disabled={saving}
              className="mt-3 px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [tab, setTab] = useState('personal')
  const [profile, setProfile] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSex, setEditSex] = useState('')
  const [editDob, setEditDob] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserEmail(user.email || '')
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        const parts = (p.full_name || '').split(' ')
        setEditFirst(parts[0] || '')
        setEditLast(parts.slice(1).join(' ') || '')
        setEditPhone(p.phone || '')
        setEditSex(p.sex || '')
        setEditDob(p.date_of_birth || '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  function flash(msg) { setSaveMsg(msg); setTimeout(() => setSaveMsg(''), 3000) }

  async function saveName() {
    setSaving(true)
    const fullName = `${editFirst.trim()} ${editLast.trim()}`.trim()
    const supabase = createClient()
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id)
    setProfile(p => ({ ...p, full_name: fullName }))
    setSaving(false)
    flash('Name updated.')
  }

  async function savePhone() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ phone: editPhone.trim() || null }).eq('id', profile.id)
    setProfile(p => ({ ...p, phone: editPhone.trim() || null }))
    setSaving(false)
    flash('Phone number updated.')
  }

  async function saveSex() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ sex: editSex || null }).eq('id', profile.id)
    setProfile(p => ({ ...p, sex: editSex || null }))
    setSaving(false)
    flash('Sex updated.')
  }

  async function saveDob() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ date_of_birth: editDob || null }).eq('id', profile.id)
    setProfile(p => ({ ...p, date_of_birth: editDob || null }))
    setSaving(false)
    flash('Date of birth updated.')
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return <LoadingScreen />

  const formatDob = (iso) => {
    if (!iso) return 'Not provided'
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-[5px] text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-10 py-12">
        <div className="flex gap-16">

          {/* Left sidebar */}
          <nav className="w-48 shrink-0">
            <ul>
              {NAV.map((item, i) => (
                <li key={item.id} className={i < NAV.length - 1 ? 'border-b border-gray-200' : ''}>
                  <button
                    onClick={() => setTab(item.id)}
                    className={`w-full text-left py-4 pl-3 -ml-3 text-sm font-medium border-l-2 transition-all ${
                      tab === item.id
                        ? 'border-navy text-navy font-bold'
                        : 'border-transparent text-navy/60 hover:text-navy'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left py-4 text-sm font-medium text-navy/60 hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {saveMsg && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-[8px]">
                <p className="text-sm font-medium text-green-700">{saveMsg}</p>
              </div>
            )}

            {/* Personal Information */}
            {tab === 'personal' && (
              <>
                <h1 className="text-2xl font-bold text-navy mb-2">Personal Information</h1>
                <SettingRow
                  label="Name" value={profile?.full_name || 'Not provided'}
                  saving={saving} onSave={saveName}
                  editContent={
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-navy/60 mb-1.5">First Legal Name</label>
                        <input value={editFirst} onChange={e => setEditFirst(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy/60 mb-1.5">Second Legal Name</label>
                        <input value={editLast} onChange={e => setEditLast(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  }
                />
                <SettingRow
                  label="Phone Number" value={profile?.phone || 'Not provided'}
                  saving={saving} onSave={savePhone}
                  editContent={
                    <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                      placeholder="+250 7XX XXX XXX" className={inputCls} />
                  }
                />
                <SettingRow
                  label="Email Address" value={userEmail || 'Not provided'}
                  editContent={
                    <p className="text-xs text-gray-400 py-1">
                      To change your email address, contact{' '}
                      <a href="mailto:info@ndarinzwe.com" className="underline">info@ndarinzwe.com</a>.
                    </p>
                  }
                />
                <SettingRow
                  label="Address" value="Not provided"
                  saving={false}
                  editContent={
                    <input type="text" placeholder="Village, Sector, District" className={inputCls} />
                  }
                />
                <SettingRow
                  label="Sex" value={profile?.sex || 'Not provided'}
                  saving={saving} onSave={saveSex}
                  editContent={
                    <div className="flex gap-3">
                      {['Male', 'Female'].map(s => (
                        <label key={s} className={`flex-1 flex items-center justify-center py-2.5 border rounded-[5px] cursor-pointer text-sm font-medium transition-colors ${editSex === s ? 'border-navy bg-navy/5 text-navy' : 'border-gray-300 text-black/60 hover:border-navy/40'}`}>
                          <input type="radio" name="sex_edit" value={s} checked={editSex === s} onChange={() => setEditSex(s)} className="sr-only" />
                          {s}
                        </label>
                      ))}
                    </div>
                  }
                />
                <SettingRow
                  label="Date of Birth" value={formatDob(profile?.date_of_birth)}
                  saving={saving} onSave={saveDob}
                  editContent={
                    <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]} className={inputCls} />
                  }
                />
              </>
            )}

            {/* Log In & Security */}
            {tab === 'security' && (
              <>
                <h1 className="text-2xl font-bold text-navy mb-2">Log In & Security</h1>
                <div className="py-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-navy mb-1">Password</p>
                      <p className="text-sm text-gray-500">Create password</p>
                    </div>
                    <Link href="/forgot-password"
                      className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors shrink-0">
                      Create
                    </Link>
                  </div>
                </div>
                <div className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-navy mb-1">Security</p>
                      <p className="text-sm text-gray-500">Add phone number for 2 step verification</p>
                    </div>
                    <button
                      onClick={() => setTab('personal')}
                      className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors shrink-0">
                      Add
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
              <>
                <h1 className="text-2xl font-bold text-navy mb-6">Notification</h1>
                <p className="text-sm font-bold text-pink-primary mb-2">What do you have today?</p>
                <p className="text-sm text-gray-500">No current notification.</p>
              </>
            )}

            {/* Permission */}
            {tab === 'permission' && (
              <>
                <h1 className="text-2xl font-bold text-navy mb-2">Permission</h1>
                {[
                  { label: 'Location Access', desc: 'Allow Ndarinzwe to use your location to find nearby Community Health Workers.' },
                  { label: 'Push Notifications', desc: 'Receive pregnancy reminders and health updates directly on your device.' },
                ].map(item => (
                  <div key={item.label} className="py-5 border-b border-gray-100 last:border-0">
                    <p className="text-sm font-bold text-navy mb-1">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </>
            )}

            {/* Privacy & Data */}
            {tab === 'privacy' && (
              <>
                <h1 className="text-2xl font-bold text-navy mb-6">Privacy & Data</h1>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  Ndarinzwe Health is committed to protecting your personal and health information.
                  Your data is stored securely and used only to personalise your pregnancy care experience.
                </p>
                <Link href="/privacy"
                  className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
                  Read our Privacy Policy →
                </Link>
              </>
            )}

            {/* Preferences */}
            {tab === 'preferences' && (
              <>
                <h1 className="text-2xl font-bold text-navy mb-6">Preferences</h1>
                <p className="text-sm text-gray-500">
                  Notification and display preferences are managed during onboarding.
                  Contact <a href="mailto:info@ndarinzwe.com" className="underline text-navy">info@ndarinzwe.com</a> to update them.
                </p>
              </>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-400">Loading settings…</p>
      </div>
    </div>
  )
}
