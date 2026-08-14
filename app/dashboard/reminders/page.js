'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const TYPES = [
  { value: 'anc_visit',   label: 'ANC Visit',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'medication',  label: 'Medication',   color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'postnatal',   label: 'Postnatal',    color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'general',     label: 'General',      color: 'bg-gray-50 text-gray-600 border-gray-200' },
]

function typeLabel(v) { return TYPES.find(t => t.value === v)?.label || v }
function typeColor(v) { return TYPES.find(t => t.value === v)?.color || TYPES[3].color }

function fmtDT(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-[5px] text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent bg-white'

export default function RemindersPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [motherId, setMotherId] = useState(null)
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', type: 'general', body: '', scheduled_at: '' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('mothers').select('id').eq('id', user.id).single(),
      ])
      if (p?.role === 'chw') { router.push('/dashboard/chw'); return }
      setProfile(p)
      if (m) {
        setMotherId(m.id)
        const { data: r } = await supabase
          .from('reminders').select('*').eq('mother_id', m.id)
          .order('scheduled_at', { ascending: true })
        setReminders(r || [])
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.scheduled_at) { setError('Title and date/time are required.'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('reminders')
      .insert({ mother_id: motherId, title: form.title.trim(), type: form.type, body: form.body.trim() || null, scheduled_at: form.scheduled_at })
      .select().single()
    if (err) { setError('Failed to save. Please try again.'); setSaving(false); return }
    setReminders(r => [...r, data].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)))
    setForm({ title: '', type: 'general', body: '', scheduled_at: '' })
    setAdding(false); setSaving(false)
  }

  async function handleDelete(id) {
    const supabase = createClient()
    await supabase.from('reminders').delete().eq('id', id)
    setReminders(r => r.filter(x => x.id !== id))
  }

  async function handleToggle(reminder) {
    const supabase = createClient()
    const { data } = await supabase
      .from('reminders').update({ sent: !reminder.sent }).eq('id', reminder.id).select().single()
    if (data) setReminders(r => r.map(x => x.id === data.id ? data : x))
  }

  if (loading) return <Loading label="Loading reminders…" />

  const upcoming = reminders.filter(r => !r.sent)
  const done = reminders.filter(r => r.sent)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#FFF0F6] px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-1">Your Reminders</h1>
            <p className="text-sm font-medium text-navy/60">Stay on top of appointments, medications and check-ins.</p>
          </div>
          <button onClick={() => { setAdding(v => !v); setError('') }}
            className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity">
            {adding ? 'Cancel' : '+ Add Reminder'}
          </button>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {adding && (
          <form onSubmit={handleAdd} className="mb-8 p-6 border border-gray-200 rounded-[10px] bg-gray-50 space-y-4">
            <h2 className="text-sm font-bold text-navy">New Reminder</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Title *</label>
                <input value={form.title} onChange={set('title')} placeholder="e.g. ANC Visit at Kacyiru Health Centre" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Type *</label>
                <select value={form.type} onChange={set('type')} className={inputCls}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Date & Time *</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Note (optional)</label>
                <input value={form.body} onChange={set('body')} placeholder="Any extra details…" className={inputCls} />
              </div>
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 disabled:opacity-60 transition-opacity">
              {saving ? 'Saving…' : 'Save Reminder'}
            </button>
          </form>
        )}

        <div className="mb-10">
          <h2 className="text-sm font-bold text-navy mb-4">Upcoming ({upcoming.length})</h2>
          {upcoming.length === 0 ? (
            <div className="py-10 border border-dashed border-gray-200 rounded-[10px] text-center">
              <p className="text-sm text-gray-400">No upcoming reminders. Add one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(r => (
                <ReminderRow key={r.id} r={r} onDelete={handleDelete} onToggle={handleToggle} />
              ))}
            </div>
          )}
        </div>

        {done.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-navy/40 mb-4">Completed ({done.length})</h2>
            <div className="space-y-3 opacity-50">
              {done.map(r => <ReminderRow key={r.id} r={r} onDelete={handleDelete} onToggle={handleToggle} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function ReminderRow({ r, onDelete, onToggle }) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 border border-gray-200 rounded-[10px] bg-white">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${typeColor(r.type)}`}>{typeLabel(r.type)}</span>
          {r.sent && <span className="text-xs font-medium text-green-600">✓ Done</span>}
        </div>
        <p className={`text-sm font-bold text-navy mb-0.5 ${r.sent ? 'line-through opacity-40' : ''}`}>{r.title}</p>
        {r.body && <p className="text-xs text-gray-400 mb-1">{r.body}</p>}
        <p className="text-xs font-medium text-gray-400">{fmtDT(r.scheduled_at)}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => onToggle(r)} className="text-xs font-medium text-navy/60 hover:text-navy underline underline-offset-2 transition-colors">
          {r.sent ? 'Undo' : 'Mark done'}
        </button>
        <button onClick={() => onDelete(r.id)} className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">Delete</button>
      </div>
    </div>
  )
}

function Loading({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-400">{label}</p>
      </div>
    </div>
  )
}
