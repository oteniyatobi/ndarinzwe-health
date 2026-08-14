'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const VISIT_TYPES = [
  { value: 'antenatal',  label: 'Antenatal Visit' },
  { value: 'postnatal',  label: 'Postnatal Visit' },
  { value: 'general',    label: 'General Check-Up' },
  { value: 'emergency',  label: 'Emergency' },
]

const STATUS_TYPES = [
  { value: 'scheduled',  label: 'Scheduled',  cls: 'bg-blue-50 text-blue-700' },
  { value: 'completed',  label: 'Completed',  cls: 'bg-green-50 text-green-700' },
  { value: 'missed',     label: 'Missed',     cls: 'bg-red-50 text-red-700' },
]

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function today() { return new Date().toISOString().split('T')[0] }

const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-[5px] text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent bg-white'

function ChwSchedulePage() {
  const router = useRouter()
  const params = useSearchParams()
  const preselectedMother = params.get('mother')

  const [profile, setProfile] = useState(null)
  const [chwId, setChwId] = useState(null)
  const [mothers, setMothers] = useState([])
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(!!preselectedMother)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('scheduled')

  const [form, setForm] = useState({
    mother_id: preselectedMother || '',
    visit_date: '',
    visit_type: 'antenatal',
    notes: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p?.role !== 'chw') { router.push('/dashboard'); return }
      setProfile(p)
      setChwId(user.id)

      const [{ data: ms }, { data: vs }] = await Promise.all([
        supabase.from('mothers').select('id, profiles(full_name)').eq('linked_chw_id', user.id),
        supabase.from('chw_visits').select('*').eq('chw_id', user.id).order('visit_date', { ascending: false }),
      ])

      setMothers((ms || []).map(m => ({ id: m.id, name: m.profiles?.full_name || 'Unknown' })))
      setVisits(vs || [])
      setLoading(false)
    }
    load()
  }, [router])

  function motherName(id) {
    return mothers.find(m => m.id === id)?.name || '—'
  }

  function statusLabel(v) { return STATUS_TYPES.find(s => s.value === v)?.label || v }
  function statusCls(v) { return STATUS_TYPES.find(s => s.value === v)?.cls || '' }
  function visitTypeLabel(v) { return VISIT_TYPES.find(t => t.value === v)?.label || v }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.mother_id || !form.visit_date) { setError('Mother and visit date are required.'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.from('chw_visits').insert({
      chw_id: chwId,
      mother_id: form.mother_id,
      visit_date: form.visit_date,
      visit_type: form.visit_type,
      notes: form.notes.trim() || null,
      status: 'scheduled',
    }).select().single()
    if (err) { setError('Failed to schedule. Please try again.'); setSaving(false); return }
    setVisits(v => [data, ...v])
    setForm({ mother_id: preselectedMother || '', visit_date: '', visit_type: 'antenatal', notes: '' })
    setAdding(false); setSaving(false)
  }

  async function updateStatus(visitId, newStatus) {
    setUpdatingId(visitId)
    const supabase = createClient()
    const { data } = await supabase.from('chw_visits').update({ status: newStatus }).eq('id', visitId).select().single()
    if (data) setVisits(vs => vs.map(v => v.id === data.id ? data : v))
    setUpdatingId(null)
  }

  async function handleDelete(visitId) {
    const supabase = createClient()
    await supabase.from('chw_visits').delete().eq('id', visitId)
    setVisits(vs => vs.filter(v => v.id !== visitId))
  }

  if (loading) return <Loading label="Loading schedule…" />

  const shown = statusFilter === 'all' ? visits : visits.filter(v => v.status === statusFilter)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#F0F4FF] px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-1">Visit Schedule</h1>
            <p className="text-sm font-medium text-navy/60">Plan and track home visits for your assigned mothers.</p>
          </div>
          <button onClick={() => { setAdding(v => !v); setError('') }}
            className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity">
            {adding ? 'Cancel' : '+ Schedule Visit'}
          </button>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-8">
        <Link href="/dashboard/chw" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {adding && (
          <form onSubmit={handleAdd} className="mb-8 p-6 border border-gray-200 rounded-[10px] bg-gray-50 space-y-4">
            <h2 className="text-sm font-bold text-navy">New Visit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Mother *</label>
                <select value={form.mother_id} onChange={e => setForm(f => ({ ...f, mother_id: e.target.value }))} className={inputCls}>
                  <option value="">Select mother…</option>
                  {mothers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Visit Date *</label>
                <input type="date" value={form.visit_date} min={today()}
                  onChange={e => setForm(f => ({ ...f, visit_date: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Visit Type *</label>
                <select value={form.visit_type} onChange={e => setForm(f => ({ ...f, visit_type: e.target.value }))} className={inputCls}>
                  {VISIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Notes (optional)</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes about this visit…" className={inputCls} />
              </div>
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 disabled:opacity-60 transition-opacity">
              {saving ? 'Scheduling…' : 'Schedule Visit'}
            </button>
          </form>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'scheduled', 'completed', 'missed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all capitalize ${statusFilter === s ? 'bg-navy text-white border-navy' : 'border-gray-200 text-navy hover:border-navy/40'}`}>
              {s === 'all' ? 'All' : statusLabel(s)} ({s === 'all' ? visits.length : visits.filter(v => v.status === s).length})
            </button>
          ))}
        </div>

        {shown.length === 0 && (
          <div className="py-14 text-center border border-dashed border-gray-200 rounded-[10px]">
            <p className="text-sm text-gray-400">No visits{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''} yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {shown.map(v => (
            <div key={v.id} className="p-5 border border-gray-200 rounded-[10px]">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-sm font-bold text-navy mb-0.5">{motherName(v.mother_id)}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{visitTypeLabel(v.visit_type)}</p>
                    <span className="text-gray-300">·</span>
                    <p className="text-xs font-medium text-gray-500">{fmtDate(v.visit_date)}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${statusCls(v.status)}`}>{statusLabel(v.status)}</span>
              </div>
              {v.notes && <p className="text-xs text-gray-400 mb-3">{v.notes}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                {v.status === 'scheduled' && (
                  <>
                    <button onClick={() => updateStatus(v.id, 'completed')} disabled={updatingId === v.id}
                      className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors disabled:opacity-50">
                      Mark completed
                    </button>
                    <button onClick={() => updateStatus(v.id, 'missed')} disabled={updatingId === v.id}
                      className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50">
                      Mark missed
                    </button>
                  </>
                )}
                {v.status !== 'scheduled' && (
                  <button onClick={() => updateStatus(v.id, 'scheduled')} disabled={updatingId === v.id}
                    className="text-xs font-medium text-navy/60 hover:text-navy transition-colors disabled:opacity-50">
                    Reopen
                  </button>
                )}
                <button onClick={() => handleDelete(v.id)}
                  className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
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

export default function ChwSchedulePageWrapper() {
  return <Suspense><ChwSchedulePage /></Suspense>
}
