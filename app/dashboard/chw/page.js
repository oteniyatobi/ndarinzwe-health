'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

function weeksPregnant(lmpDate, dueDate) {
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

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function Card({ title, children, button }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] p-6 flex flex-col">
      <h2 className="text-lg font-bold text-navy mb-5">{title}</h2>
      <div className="flex-1">{children}</div>
      {button && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          {button}
        </div>
      )}
    </div>
  )
}

function OutlineBtn({ href, onClick, children }) {
  const cls = "w-full block text-center py-3 border border-gray-300 rounded-[8px] text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return <button onClick={onClick} className={cls}>{children}</button>
}

function DataRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 mb-2 last:mb-0">
      <span className="text-sm font-bold text-navy shrink-0">{label}:</span>
      <span className="text-sm text-gray-500">{value || '—'}</span>
    </div>
  )
}

export default function CHWDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [chw, setChw] = useState(null)
  const [mothers, setMothers] = useState([])
  const [visits, setVisits] = useState([])
  const [reportsCount, setReportsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('chws').select('*').eq('id', user.id).single(),
      ])

      if (p?.role === 'mother') { router.push('/dashboard'); return }
      setProfile(p)
      setChw(c)

      const today = new Date().toISOString().split('T')[0]
      const [{ data: assignedMothers }, { data: todayVisits }, { count: reportsCnt }] = await Promise.all([
        supabase.from('mothers').select('id, due_date, lmp_date, district, sector, profiles(full_name, phone)')
          .eq('linked_chw_id', user.id).order('due_date', { ascending: true }),
        supabase.from('chw_visits').select('*').eq('chw_id', user.id).eq('visit_date', today).eq('status', 'scheduled'),
        supabase.from('chw_reports').select('id', { count: 'exact', head: true }).eq('chw_id', user.id),
      ])

      setMothers(assignedMothers || [])
      setVisits(todayVisits || [])
      setReportsCount(reportsCnt || 0)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <LoadingScreen />

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const mostRecentMother = mothers[0]
  const mostRecentWeeks = mostRecentMother ? weeksPregnant(mostRecentMother.lmp_date, mostRecentMother.due_date) : null
  const nextFollowUp = mostRecentMother?.due_date
    ? new Date(new Date(mostRecentMother.due_date).getTime() - 14 * 86400000)
    : null

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      {/* Hero banner */}
      <section className="bg-[#FFF0F6] px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-base font-medium text-navy/60">
            Stay updated on your assigned mothers and manage their care activities from one place.
          </p>
        </div>
      </section>

      {/* Cards grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Mother's Care Overview */}
          <Card title="Mother's Care Overview" button={<OutlineBtn href="/dashboard/chw/mothers">View Mothers</OutlineBtn>}>
            <p className="text-sm font-bold text-navy mb-3">Mothers</p>
            <DataRow label="Assigned Mothers" value={String(mothers.length)} />
            {mostRecentMother ? (
              <>
                <DataRow
                  label="Active Pregnancy"
                  value={`${mostRecentMother.profiles?.full_name || 'Mother'}${mostRecentWeeks !== null ? ` (${mostRecentWeeks} Weeks)` : ''}`}
                />
                <DataRow label="Next Follow-Up" value={nextFollowUp ? formatDate(nextFollowUp.toISOString()) : '—'} />
              </>
            ) : (
              <p className="text-sm font-medium text-gray-400 mt-2">
                No mothers linked yet. Share your CHW code: <strong className="text-navy">{chw?.chw_code}</strong>
              </p>
            )}
          </Card>

          {/* Care Alerts */}
          <Card title="Care Alerts" button={<OutlineBtn href="/dashboard/chw/alerts">View Alerts</OutlineBtn>}>
            <p className="text-sm font-bold text-navy mb-3">Priority Updates</p>
            <DataRow label="High Priority" value={String(mothers.filter(m => {
              if (!m.due_date) return false
              const days = Math.ceil((new Date(m.due_date).getTime() - Date.now()) / 86400000)
              return days <= 14
            }).length)} />
            <p className="text-sm font-bold text-navy mt-4 mb-2">Upcoming Events</p>
            <DataRow label="Today's Visits" value={visits.length > 0 ? `${visits.length} scheduled` : 'No visits today'} />
          </Card>

          {/* Visit Schedule */}
          <Card title="Visit Schedule" button={<OutlineBtn href="/dashboard/chw/schedule">View Schedule</OutlineBtn>}>
            <p className="text-sm font-bold text-navy mb-3">My Visit Roster</p>
            <DataRow label="Today's Visits" value={visits.length > 0 ? `${visits.length} scheduled` : '0'} />
            {visits.length > 0 ? (
              <DataRow label="Next Visit" value={mothers.find(m => m.id === visits[0]?.mother_id)?.profiles?.full_name || '—'} />
            ) : (
              <p className="text-sm font-medium text-gray-400 mt-2">No visits scheduled today.</p>
            )}
          </Card>

          {/* Recommended Resources */}
          <Card title="Recommended Resources" button={<OutlineBtn href="/resources">Explore Resources</OutlineBtn>}>
            <p className="text-sm font-medium text-gray-400">
              Clinical guides and community health protocols for CHWs — sourced from Rwanda Ministry of Health and RBC.
            </p>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-3">
              <OutlineBtn href="/dashboard/chw/reminders">Set Reminder</OutlineBtn>
              <OutlineBtn href="/dashboard/chw/schedule">Schedule Visit</OutlineBtn>
              <OutlineBtn href="/dashboard/messages">Contact Mother</OutlineBtn>
            </div>
          </Card>

          {/* Care Reports */}
          <Card title="Care Reports" button={<OutlineBtn href="/dashboard/chw/reports">View Reports</OutlineBtn>}>
            <p className="text-sm font-bold text-navy mb-3">My Reports Summary</p>
            <DataRow label="Reports Submitted" value={`${reportsCount} report${reportsCount !== 1 ? 's' : ''}`} />
            <DataRow label="Mothers Assigned" value={String(mothers.length)} />
            <DataRow label="Latest Mother" value={mostRecentMother?.profiles?.full_name || '—'} />
          </Card>

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
        <p className="text-sm font-medium text-gray-400">Loading your dashboard…</p>
      </div>
    </div>
  )
}
