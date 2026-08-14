'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

/* ── Pregnancy helpers ───────────────────────────────────────── */
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

function getTrimester(weeks) {
  if (!weeks) return null
  if (weeks <= 13) return 'First Trimester'
  if (weeks <= 26) return 'Second Trimester'
  return 'Third Trimester'
}

function getNextMilestone(weeks) {
  if (!weeks) return '—'
  if (weeks < 12) return 'First ANC Visit'
  if (weeks < 16) return 'Anatomy Scan'
  if (weeks < 20) return 'Anatomy Scan'
  if (weeks < 24) return 'Glucose Tolerance Test'
  if (weeks < 28) return 'Third Trimester Check'
  if (weeks < 32) return 'Growth Scan'
  if (weeks < 36) return 'Group B Strep Test'
  return 'Birth Preparation'
}

function getBabySize(weeks) {
  const sizes = {
    4: 'Poppy seed', 5: 'Apple seed', 6: 'Pea', 7: 'Blueberry', 8: 'Raspberry',
    9: 'Grape', 10: 'Kumquat', 11: 'Fig', 12: 'Lime', 13: 'Lemon',
    14: 'Peach', 15: 'Apple', 16: 'Avocado', 17: 'Pear', 18: 'Mango',
    19: 'Tomato', 20: 'Banana', 21: 'Carrot', 22: 'Papaya', 23: 'Grapefruit',
    24: 'Corn', 25: 'Cauliflower', 26: 'Lettuce', 27: 'Cabbage', 28: 'Eggplant',
    29: 'Butternut squash', 30: 'Cabbage', 31: 'Coconut', 32: 'Jicama',
    33: 'Pineapple', 34: 'Cantaloupe', 35: 'Honeydew melon', 36: 'Romaine lettuce',
    37: 'Winter melon', 38: 'Leek', 39: 'Watermelon', 40: 'Pumpkin',
  }
  return sizes[weeks] || '—'
}

function getBabyDevelopment(weeks) {
  if (!weeks) return '—'
  if (weeks <= 13) return 'All major organs are forming. Baby is developing rapidly.'
  if (weeks <= 20) return 'Baby is growing stronger and developing movements.'
  if (weeks <= 28) return 'Baby can hear sounds and is practicing breathing.'
  if (weeks <= 36) return 'Baby is gaining weight and preparing for birth.'
  return 'Baby is fully developed and ready to meet you soon.'
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

/* ── Shared card components ─────────────────────────────────── */
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

/* ── Page ─────────────────────────────────────────────────────── */
export default function MotherDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [mother, setMother] = useState(null)
  const [chwProfile, setChwProfile] = useState(null)
  const [todayLog, setTodayLog] = useState(null)
  const [reminders, setReminders] = useState([])
  const [upcomingVisits, setUpcomingVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('mothers').select('*, chws(id, sector, district, profiles(full_name, phone))').eq('id', user.id).single(),
      ])

      if (p?.role === 'chw') { router.push('/dashboard/chw'); return }
      setProfile(p)
      setMother(m)
      if (m?.chws) setChwProfile(m.chws)

      const todayStr = new Date().toISOString().split('T')[0]
      if (m?.id) {
        const [{ data: hl }, { data: rs }, { data: vs }] = await Promise.all([
          supabase.from('health_logs').select('*').eq('mother_id', m.id).eq('logged_date', todayStr).single(),
          supabase.from('reminders').select('*').eq('mother_id', m.id).eq('sent', false)
            .gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(3),
          supabase.from('chw_visits').select('*').eq('mother_id', m.id).eq('status', 'scheduled')
            .gte('visit_date', todayStr).order('visit_date', { ascending: true }).limit(3),
        ])
        setTodayLog(hl)
        setReminders(rs || [])
        setUpcomingVisits(vs || [])
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <LoadingScreen />

  const weeks = calcWeeks(mother?.lmp_date, mother?.due_date)
  const trimester = getTrimester(weeks)
  const nextMilestone = getNextMilestone(weeks)
  const babySize = getBabySize(weeks)
  const babyDev = getBabyDevelopment(weeks)
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const chwName = chwProfile?.profiles?.full_name || null
  const progressPct = weeks ? Math.min(100, (weeks / 40) * 100) : 0

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
            {weeks !== null
              ? `You're currently ${weeks} weeks pregnant. Here's what's important today.`
              : "Welcome to your pregnancy dashboard. Here's what's important today."}
          </p>
        </div>
      </section>

      {/* Cards grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* My Pregnancy Progress */}
          <Card title="My Pregnancy Progress" button={<OutlineBtn href="/journey">View Pregnancy Journey</OutlineBtn>}>
            {weeks !== null ? (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-navy h-2 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-5">{weeks} of 40 Weeks</p>
              </>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-5" />
            )}
            <p className="text-sm font-bold text-navy mb-3">Progress Data</p>
            <DataRow label="Due Date" value={formatDate(mother?.due_date)} />
            <DataRow label="Baby Size" value={babySize} />
            <DataRow label="Next Milestone" value={nextMilestone} />
          </Card>

          {/* Upcoming Reminders */}
          <Card title="Upcoming Reminders" button={<OutlineBtn href="/dashboard/reminders">View All Reminders</OutlineBtn>}>
            {reminders.length > 0 ? (
              <div className="space-y-4">
                {reminders.map(r => (
                  <div key={r.id}>
                    <p className="text-sm font-bold text-navy">{r.title}</p>
                    <p className="text-xs font-medium text-gray-400 mt-0.5">
                      {new Date(r.scheduled_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400">No upcoming reminders. <Link href="/dashboard/reminders" className="text-navy underline underline-offset-2">Add one</Link>.</p>
            )}
          </Card>

          {/* My Health Overview */}
          <Card title="My Health Overview" button={<OutlineBtn href="/dashboard/health">{todayLog ? 'View Check-In' : 'Do Today\'s Check-In'}</OutlineBtn>}>
            <p className="text-sm font-bold text-navy mb-3">Today's Check-In</p>
            {todayLog ? (
              <>
                <DataRow label="Mood" value={todayLog.mood ? todayLog.mood.charAt(0).toUpperCase() + todayLog.mood.slice(1) : '—'} />
                <DataRow label="Symptoms" value={todayLog.symptoms?.length ? todayLog.symptoms.join(', ') : 'None reported'} />
                <DataRow label="Nutrition" value={todayLog.nutrition === 'on_track' ? 'On Track' : todayLog.nutrition === 'needs_improvement' ? 'Needs Improvement' : todayLog.nutrition === 'poor' ? 'Poor' : '—'} />
                <DataRow label="Recommendation" value={weeks && weeks >= 16 ? 'Increase iron-rich foods this week.' : 'Stay hydrated and rest well.'} />
              </>
            ) : (
              <p className="text-sm font-medium text-gray-400">You haven't checked in today. <Link href="/dashboard/health" className="text-navy underline underline-offset-2">Log how you're feeling</Link>.</p>
            )}
          </Card>

          {/* Recommended Resources */}
          <Card title="Recommended Resources" button={<OutlineBtn href="/resources">Explore Resources</OutlineBtn>}>
            <p className="text-sm font-medium text-gray-400">
              Evidence-based articles and guides on pregnancy, nutrition, and postnatal care — sourced from Rwanda Ministry of Health and RBC.
            </p>
          </Card>

          {/* CHW Visits */}
          <Card title="Scheduled CHW Visits" button={<OutlineBtn href="/dashboard/find-chw">{upcomingVisits.length > 0 ? 'View All' : 'Find a CHW'}</OutlineBtn>}>
            {upcomingVisits.length > 0 ? (
              <div className="space-y-4">
                {upcomingVisits.map(v => (
                  <div key={v.id}>
                    <p className="text-sm font-bold text-navy capitalize">{v.visit_type} Visit</p>
                    <p className="text-xs font-medium text-gray-400 mt-0.5">
                      {new Date(v.visit_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {v.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{v.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-400">No visits scheduled yet.</p>
            )}
          </Card>

          {/* My Care Team */}
          <Card title="My Care Team" button={
            chwName
              ? <OutlineBtn href="/dashboard/messages">Contact CHW</OutlineBtn>
              : <OutlineBtn href="/dashboard/find-chw">Find a CHW Near You</OutlineBtn>
          }>
            {chwName ? (
              <>
                <DataRow label="Assigned Community Health Worker" value={chwName} />
                <DataRow label="Health Facility" value={[chwProfile?.sector, chwProfile?.district].filter(Boolean).join(' Health Centre, ') || '—'} />
                {chwProfile?.health_facility && <DataRow label="Facility" value={chwProfile.health_facility} />}
              </>
            ) : (
              <p className="text-sm font-medium text-gray-400">
                No CHW linked yet. Find a community health worker near you.
              </p>
            )}
          </Card>

          {/* Pregnancy Timeline */}
          <Card title="Pregnancy Timeline" button={<OutlineBtn href="/journey">View Timeline</OutlineBtn>}>
            <p className="text-sm font-bold text-navy mb-3">Today's Check-In</p>
            <DataRow label="Current Week" value={weeks !== null ? `${weeks} Weeks` : '—'} />
            <DataRow label="Trimester" value={trimester || '—'} />
            <DataRow label="Next Milestone" value={nextMilestone} />
            <DataRow label="Baby Development Update" value={babyDev} />
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
