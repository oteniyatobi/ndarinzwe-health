'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const VISIT_TYPES = ['Antenatal', 'Postnatal', 'General', 'Emergency']

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function today() { return new Date().toISOString().split('T')[0] }

const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-[5px] text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent bg-white'

function ChwReportsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const preselectedMother = params.get('mother')

  const [profile, setProfile] = useState(null)
  const [chwId, setChwId] = useState(null)
  const [mothers, setMothers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(!!preselectedMother)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const [form, setForm] = useState({
    mother_id: preselectedMother || '',
    report_date: today(),
    visit_type: 'Antenatal',
    observations: '',
    action_taken: '',
    follow_up_needed: false,
    follow_up_date: '',
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

      const [{ data: ms }, { data: rs }] = await Promise.all([
        supabase.from('mothers').select('id, profiles(full_name)').eq('linked_chw_id', user.id),
        supabase.from('chw_reports').select('*').eq('chw_id', user.id).order('report_date', { ascending: false }),
      ])
      setMothers((ms || []).map(m => ({ id: m.id, name: m.profiles?.full_name || 'Unknown' })))
      setReports(rs || [])
      setLoading(false)
    }
    load()
  }, [router])

  function motherName(id) { return mothers.find(m => m.id === id)?.name || '—' }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.mother_id || !form.observations.trim()) { setError('Mother and observations are required.'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.from('chw_reports').insert({
      chw_id: chwId,
      mother_id: form.mother_id,
      report_date: form.report_date,
      visit_type: form.visit_type,
      observations: form.observations.trim(),
      action_taken: form.action_taken.trim() || null,
      follow_up_needed: form.follow_up_needed,
      follow_up_date: form.follow_up_needed && form.follow_up_date ? form.follow_up_date : null,
    }).select().single()
    if (err) { setError('Failed to save report.'); setSaving(false); return }
    setReports(rs => [data, ...rs])
    setForm({ mother_id: preselectedMother || '', report_date: today(), visit_type: 'Antenatal', observations: '', action_taken: '', follow_up_needed: false, follow_up_date: '' })
    setAdding(false); setSaving(false)
  }

  if (loading) return <Loading label="Loading reports…" />

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#F0F4FF] px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-1">Care Reports</h1>
            <p className="text-sm font-medium text-navy/60">Document visit findings and follow-up actions.</p>
          </div>
          <button onClick={() => { setAdding(v => !v); setError('') }}
            className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity">
            {adding ? 'Cancel' : '+ New Report'}
          </button>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-8">
        <Link href="/dashboard/chw" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {adding && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 rounded-[10px] bg-gray-50 space-y-5">
            <h2 className="text-sm font-bold text-navy">New Care Report</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Mother *</label>
                <select value={form.mother_id} onChange={set('mother_id')} className={inputCls}>
                  <option value="">Select mother…</option>
                  {mothers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Visit Date *</label>
                <input type="date" value={form.report_date} onChange={set('report_date')} max={today()} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Visit Type</label>
                <select value={form.visit_type} onChange={set('visit_type')} className={inputCls}>
                  {VISIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy/60 mb-1.5">Observations *</label>
              <textarea value={form.observations} onChange={set('observations')}
                rows={4} placeholder="What did you observe during the visit? (e.g. blood pressure, baby position, mother's condition, concerns)"
                className={`${inputCls} resize-none`} />
            </div>

            <div>
              <label className="block text-xs font-medium text-navy/60 mb-1.5">Actions Taken</label>
              <textarea value={form.action_taken} onChange={set('action_taken')}
                rows={3} placeholder="What did you do? (e.g. referred to health facility, counselled on nutrition, arranged transport)"
                className={`${inputCls} resize-none`} />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.follow_up_needed}
                  onChange={e => setForm(f => ({ ...f, follow_up_needed: e.target.checked }))}
                  className="accent-navy rounded" />
                <span className="text-sm font-medium text-navy">Follow-up needed</span>
              </label>
              {form.follow_up_needed && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-navy/60 mb-1.5">Follow-Up Date</label>
                  <input type="date" value={form.follow_up_date} min={today()} onChange={set('follow_up_date')} className={`${inputCls} max-w-[220px]`} />
                </div>
              )}
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 disabled:opacity-60 transition-opacity">
              {saving ? 'Saving…' : 'Save Report'}
            </button>
          </form>
        )}

        {reports.length === 0 && !adding && (
          <div className="py-14 text-center border border-dashed border-gray-200 rounded-[10px]">
            <p className="text-sm text-gray-400">No reports yet. Create your first one above.</p>
          </div>
        )}

        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="border border-gray-200 rounded-[10px] overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-navy mb-0.5">{motherName(r.mother_id)}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{r.visit_type || 'Visit'}</span>
                    <span>·</span>
                    <span>{fmtDate(r.report_date)}</span>
                    {r.follow_up_needed && <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">Follow-up {r.follow_up_date ? fmtDate(r.follow_up_date) : 'needed'}</span>}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className={`text-navy/40 shrink-0 mt-1 transition-transform ${expandedId === r.id ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {expandedId === r.id && (
                <div className="px-5 pb-5 border-t border-gray-100 space-y-3 pt-4">
                  <div>
                    <p className="text-xs font-bold text-navy mb-1">Observations</p>
                    <p className="text-sm text-gray-500 whitespace-pre-wrap">{r.observations}</p>
                  </div>
                  {r.action_taken && (
                    <div>
                      <p className="text-xs font-bold text-navy mb-1">Actions Taken</p>
                      <p className="text-sm text-gray-500 whitespace-pre-wrap">{r.action_taken}</p>
                    </div>
                  )}
                </div>
              )}
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

export default function ChwReportsPageWrapper() {
  return <Suspense><ChwReportsPage /></Suspense>
}
