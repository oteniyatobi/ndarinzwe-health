'use client'

import { useEffect, useState } from 'react'
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
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function classify(mother) {
  const days = mother.daysLeft
  if (days === null) return { priority: 'info', label: 'INFO', color: 'bg-gray-100 text-gray-600' }
  if (days < 0) return { priority: 'critical', label: 'OVERDUE', color: 'bg-red-100 text-red-700' }
  if (days <= 14) return { priority: 'high', label: 'HIGH', color: 'bg-red-100 text-red-700' }
  if (days <= 28) return { priority: 'medium', label: 'MEDIUM', color: 'bg-amber-100 text-amber-700' }
  return { priority: 'low', label: 'LOW', color: 'bg-green-100 text-green-700' }
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }

export default function ChwAlertsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p?.role !== 'chw') { router.push('/dashboard'); return }
      setProfile(p)

      const { data } = await supabase
        .from('mothers')
        .select('id, lmp_date, due_date, district, sector, profiles(full_name, phone)')
        .eq('linked_chw_id', user.id)

      const list = (data || []).map(m => {
        const daysLeft = m.due_date
          ? Math.ceil((new Date(m.due_date).getTime() - Date.now()) / 86400000)
          : null
        const weeks = calcWeeks(m.lmp_date, m.due_date)
        return {
          id: m.id,
          name: m.profiles?.full_name || 'Unknown',
          phone: m.profiles?.phone || null,
          dueDate: m.due_date,
          weeks,
          daysLeft,
          district: m.district,
          sector: m.sector,
        }
      })

      const withPriority = list.map(m => ({ ...m, ...classify(m) }))
      withPriority.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9))
      setAlerts(withPriority)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <Loading label="Loading alerts…" />

  const filters = ['all', 'critical', 'high', 'medium', 'low']
  const shown = filter === 'all' ? alerts : alerts.filter(a => a.priority === filter)

  const counts = { all: alerts.length }
  filters.slice(1).forEach(f => { counts[f] = alerts.filter(a => a.priority === f).length })

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#FFF5F0] px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-navy mb-1">Priority Alerts</h1>
          <p className="text-sm font-medium text-navy/60">Mothers sorted by urgency based on due date proximity.</p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-8">
        <Link href="/dashboard/chw" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all capitalize ${filter === f ? 'bg-navy text-white border-navy' : 'border-gray-200 text-navy hover:border-navy/40'}`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] || 0})
            </button>
          ))}
        </div>

        {shown.length === 0 && (
          <div className="py-16 text-center border border-dashed border-gray-200 rounded-[10px]">
            <p className="text-sm text-gray-400">No alerts for this filter.</p>
          </div>
        )}

        <div className="space-y-3">
          {shown.map(m => (
            <div key={m.id} className="p-5 border border-gray-200 rounded-[10px]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-bold text-navy shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">{m.name}</p>
                    <p className="text-xs text-gray-400">{[m.sector, m.district].filter(Boolean).join(', ') || 'Location unknown'}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${m.color}`}>{m.label}</span>
              </div>

              <div className="mb-3 space-y-1">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-navy">Due:</span> {fmtDate(m.dueDate)}
                  {m.daysLeft !== null && (
                    <span className="ml-2 font-medium">
                      {m.daysLeft < 0 ? `(${Math.abs(m.daysLeft)} days overdue)` : `(${m.daysLeft} days remaining)`}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-navy">Gestation:</span> {m.weeks !== null ? `Week ${m.weeks} of 40` : 'Unknown'}
                </p>
              </div>

              {/* Alert guidance */}
              {m.priority === 'critical' && (
                <div className="mb-3 px-3 py-2 bg-red-50 rounded-[5px]">
                  <p className="text-xs font-bold text-red-700">Overdue — contact immediately. Arrange emergency support or referral.</p>
                </div>
              )}
              {m.priority === 'high' && (
                <div className="mb-3 px-3 py-2 bg-red-50 rounded-[5px]">
                  <p className="text-xs font-bold text-red-700">Due within 2 weeks — schedule immediate home visit. Confirm birth plan.</p>
                </div>
              )}
              {m.priority === 'medium' && (
                <div className="mb-3 px-3 py-2 bg-amber-50 rounded-[5px]">
                  <p className="text-xs text-amber-700">Due within 4 weeks — schedule visit and confirm ANC attendance.</p>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="text-xs font-medium text-navy/60 hover:text-navy transition-colors">
                    Call {m.phone}
                  </a>
                )}
                <Link href={`/dashboard/messages?with=${m.id}`}
                  className="text-xs font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
                  Message
                </Link>
                <Link href={`/dashboard/chw/schedule?mother=${m.id}`}
                  className="text-xs font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
                  Schedule visit
                </Link>
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
