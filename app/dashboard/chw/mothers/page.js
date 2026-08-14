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
    const remaining = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    return Math.max(0, Math.min(40, Math.floor((280 - remaining) / 7)))
  }
  return null
}

function daysUntilDue(dueDate) {
  if (!dueDate) return null
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
}

function urgencyBadge(days) {
  if (days === null) return null
  if (days < 0) return { label: 'Overdue', cls: 'bg-red-100 text-red-700' }
  if (days <= 14) return { label: 'Due <2 wks', cls: 'bg-red-100 text-red-700' }
  if (days <= 30) return { label: 'Due <4 wks', cls: 'bg-amber-100 text-amber-700' }
  return { label: `${Math.ceil(days / 7)} wks left`, cls: 'bg-blue-50 text-blue-700' }
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ChwMothersPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [mothers, setMothers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
        .select('id, lmp_date, due_date, district, sector, village, profiles(full_name, phone)')
        .eq('linked_chw_id', user.id)
        .order('due_date', { ascending: true })

      const list = (data || []).map(m => ({
        id: m.id,
        name: m.profiles?.full_name || 'Unknown',
        phone: m.profiles?.phone || null,
        district: m.district,
        sector: m.sector,
        village: m.village,
        lmpDate: m.lmp_date,
        dueDate: m.due_date,
        weeks: calcWeeks(m.lmp_date, m.due_date),
        days: daysUntilDue(m.due_date),
      }))
      setMothers(list)
      setFiltered(list)
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    const q = search.toLowerCase()
    if (!q) { setFiltered(mothers); return }
    setFiltered(mothers.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.district || '').toLowerCase().includes(q) ||
      (m.sector || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q)
    ))
  }, [search, mothers])

  if (loading) return <Loading label="Loading your mothers…" />

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#F0F4FF] px-6 md:px-10 py-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy mb-1">My Mothers</h1>
            <p className="text-sm font-medium text-navy/60">{mothers.length} mother{mothers.length !== 1 ? 's' : ''} assigned to you</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/chw" className="px-4 py-2 border border-navy/20 text-sm font-bold text-navy rounded-[5px] hover:bg-navy/5 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-10 py-8">

        {/* Search */}
        <div className="mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, district, sector, or phone…"
            className="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-[5px] text-sm text-navy focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-colors" />
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center border border-dashed border-gray-200 rounded-[10px]">
            <p className="text-sm text-gray-400">
              {search ? 'No mothers match your search.' : 'No mothers assigned yet.'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(m => {
            const badge = urgencyBadge(m.days)
            const pct = m.weeks !== null ? Math.min(100, Math.round((m.weeks / 40) * 100)) : 0
            return (
              <div key={m.id} className="p-5 border border-gray-200 rounded-[10px] hover:border-navy/30 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-bold text-navy shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">{m.name}</p>
                      <p className="text-xs text-gray-400">{[m.village, m.sector, m.district].filter(Boolean).join(', ') || 'Location not set'}</p>
                    </div>
                  </div>
                  {badge && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>{m.weeks !== null ? `Week ${m.weeks} of 40` : 'Weeks unknown'}</span>
                    <span>Due {fmtDate(m.dueDate)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 bg-navy rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  {m.phone && (
                    <a href={`tel:${m.phone}`}
                      className="text-xs font-medium text-navy/60 hover:text-navy transition-colors">
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
                  <Link href={`/dashboard/chw/reports?mother=${m.id}`}
                    className="text-xs font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
                    Write report
                  </Link>
                </div>
              </div>
            )
          })}
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
