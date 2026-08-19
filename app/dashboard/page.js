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

function getBabyAge(dueDate) {
  if (!dueDate) return '—'
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000)
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} old`
  const weeks = Math.floor(days / 7)
  if (weeks < 8) return `${weeks} week${weeks !== 1 ? 's' : ''} old`
  const months = Math.floor(days / 30)
  return `${months} month${months !== 1 ? 's' : ''} old`
}

function getPostpartumMilestone(dueDate) {
  if (!dueDate) return '—'
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000)
  if (days < 2) return '24–48h Postnatal Check'
  if (days < 7) return '7-Day Postnatal Visit'
  if (days < 42) return '6-Week Postnatal Check'
  const weeks = Math.floor(days / 7)
  if (weeks < 6) return 'Penta 1 + Polio 1 (6 weeks)'
  if (weeks < 10) return 'Penta 2 + Polio 2 (10 weeks)'
  if (weeks < 14) return 'Penta 3 + Polio 3 (14 weeks)'
  if (weeks < 36) return 'Measles + Yellow Fever (9 months)'
  return 'Routine Growth Monitoring'
}

function getPostpartumTip(dueDate) {
  if (!dueDate) return 'Track your recovery and baby\'s growth here.'
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000)
  if (days < 7) return 'Breastfeed on demand — aim for 8–12 feeds in 24 hours. Colostrum (the first milk) is rich in antibodies your baby needs.'
  if (days < 42) return 'Your 6-week postnatal check is important. A doctor or nurse will assess your recovery and your baby\'s growth and first vaccines.'
  const months = Math.floor(days / 30)
  if (months < 6) return 'Exclusive breastfeeding for the first 6 months gives your baby everything they need and protects against infections.'
  return 'From 6 months, start introducing soft, nutritious foods alongside breast milk. Continue breastfeeding up to 2 years.'
}

const IMMUNISATION_SCHEDULE = [
  { weeks: 0,  label: 'At Birth',  vaccines: 'BCG, Polio 0 (OPV)' },
  { weeks: 6,  label: '6 Weeks',   vaccines: 'Penta 1, Polio 1, PCV 1, ROTA 1' },
  { weeks: 10, label: '10 Weeks',  vaccines: 'Penta 2, Polio 2, PCV 2, ROTA 2' },
  { weeks: 14, label: '14 Weeks',  vaccines: 'Penta 3, Polio 3, PCV 3' },
  { weeks: 39, label: '9 Months',  vaccines: 'Measles 1, Yellow Fever' },
  { weeks: 65, label: '15 Months', vaccines: 'Measles 2 (MR booster)' },
]

const POSTNATAL_TIPS = [
  { icon: '🤱', title: 'Breastfeeding', body: 'Exclusive breastfeeding for 6 months protects your baby from infections and supports healthy brain development.' },
  { icon: '🛏️', title: 'Rest & Recovery', body: 'Rest as much as possible. Caesarean recovery takes 6–8 weeks — avoid heavy lifting until your provider approves.' },
  { icon: '💊', title: 'Iron Supplements', body: 'Continue iron and folic acid supplements as prescribed. Anaemia is common postpartum and must be treated.' },
  { icon: '🏥', title: 'Postnatal Visits', body: 'Attend your 24–48h, 7-day, and 6-week checks. These catch complications and provide your baby\'s first vaccines.' },
]

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
  const isPostpartum = mother?.due_date && new Date(mother.due_date) < new Date()

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
            {isPostpartum
              ? "Welcome back. Here's your postpartum care overview."
              : weeks !== null
                ? `You're currently ${weeks} weeks pregnant. Here's what's important today.`
                : "Welcome to your pregnancy dashboard. Here's what's important today."}
          </p>
          {/* Emergency notice */}
          <div className="mt-4 inline-flex items-start gap-2 bg-red-50 border border-red-200 rounded-[8px] px-4 py-2.5">
            <span className="text-red-600 mt-0.5 shrink-0">⚠</span>
            <p className="text-xs font-medium text-red-700">
              For any emergency — heavy bleeding, fits, baby not moving, severe pain — go to your nearest hospital immediately. Do not wait.
            </p>
          </div>
        </div>
      </section>

      {/* Cards grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── POSTPARTUM MODE ── */}
          {isPostpartum ? (
            <>
              {/* Baby Growth */}
              <Card title="Baby Growth & Development" button={<OutlineBtn href="/resources/supporting-babys-healthy-growth">View Baby Guide</OutlineBtn>}>
                <p className="text-sm font-bold text-navy mb-3">Postpartum Overview</p>
                <DataRow label="Delivery Date" value={formatDate(mother?.due_date)} />
                <DataRow label="Baby Age" value={getBabyAge(mother?.due_date)} />
                <DataRow label="Next Milestone" value={getPostpartumMilestone(mother?.due_date)} />
                <div className="mt-4 p-3 bg-pink-primary/10 rounded-[8px]">
                  <p className="text-xs font-medium text-navy leading-relaxed">{getPostpartumTip(mother?.due_date)}</p>
                </div>
              </Card>

              {/* Immunisation Schedule */}
              <Card title="Baby Immunisation Schedule" button={<OutlineBtn href="/resources/supporting-babys-healthy-growth">Full Schedule</OutlineBtn>}>
                <p className="text-xs font-medium text-gray-400 mb-3">Rwanda EPI Programme — Free at all health facilities</p>
                <div className="space-y-2">
                  {IMMUNISATION_SCHEDULE.map(v => {
                    const babyAgeWeeks = mother?.due_date
                      ? Math.floor((Date.now() - new Date(mother.due_date).getTime()) / (7 * 86400000))
                      : 0
                    const done = babyAgeWeeks > v.weeks
                    const next = !done && babyAgeWeeks >= (v.weeks - 1)
                    return (
                      <div key={v.label} className={`flex items-center gap-3 py-1.5 px-3 rounded-[6px] ${next ? 'bg-pink-primary/10' : ''}`}>
                        <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${done ? 'bg-green-500 text-white' : next ? 'bg-pink-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {done ? '✓' : '·'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-navy">{v.label}</p>
                          <p className="text-xs text-gray-400 truncate">{v.vaccines}</p>
                        </div>
                        {next && <span className="text-[10px] font-bold text-pink-primary shrink-0">Due soon</span>}
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Postpartum care tips */}
              <Card title="Postnatal Care Tips" button={<OutlineBtn href="/resources/recovery-after-childbirth">Read Full Guide</OutlineBtn>}>
                <p className="text-sm font-bold text-navy mb-3">Recovery & Breastfeeding</p>
                <div className="space-y-3">
                  {POSTNATAL_TIPS.map(tip => (
                    <div key={tip.title} className="flex gap-3">
                      <span className="text-lg shrink-0">{tip.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-navy">{tip.title}</p>
                        <p className="text-xs font-medium text-gray-500 leading-relaxed">{tip.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* ── PREGNANCY MODE ── */}
              {/* My Pregnancy Progress */}
              <Card title="My Pregnancy Progress" button={<OutlineBtn href="/journey">View Pregnancy Journey</OutlineBtn>}>
                {weeks !== null ? (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-navy h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
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

              {/* Pregnancy Timeline */}
              <Card title="Pregnancy Timeline" button={<OutlineBtn href="/journey">View Timeline</OutlineBtn>}>
                <DataRow label="Current Week" value={weeks !== null ? `${weeks} Weeks` : '—'} />
                <DataRow label="Trimester" value={trimester || '—'} />
                <DataRow label="Next Milestone" value={nextMilestone} />
                <DataRow label="Baby Development" value={babyDev} />
              </Card>

              {/* Birth Plan */}
              <Card title="My Birth Plan" button={<OutlineBtn href="/dashboard/birth-plan">Open Birth Plan</OutlineBtn>}>
                <p className="text-sm font-medium text-gray-400 leading-relaxed">
                  Plan where you will give birth, who will support you, and what to bring — so you're fully prepared when labour begins.
                </p>
                {weeks !== null && weeks >= 28 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-[8px]">
                    <p className="text-xs font-medium text-amber-800">You're in your third trimester — a good time to finalise your birth plan.</p>
                  </div>
                )}
              </Card>

              {/* Baby Names */}
              <Card title="Baby Names" button={<OutlineBtn href="/dashboard/baby-names">Explore Names</OutlineBtn>}>
                <p className="text-sm font-medium text-gray-400 leading-relaxed">
                  Browse Rwandan baby names with their meanings in Kinyarwanda — and save your favourites.
                </p>
              </Card>
            </>
          )}

          {/* ── ALWAYS SHOWN ── */}

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
          <Card title="My Health Overview" button={<OutlineBtn href="/dashboard/health">{todayLog ? 'View Check-In' : "Do Today's Check-In"}</OutlineBtn>}>
            <p className="text-sm font-bold text-navy mb-3">Today's Check-In</p>
            {todayLog ? (
              <>
                <DataRow label="Mood" value={todayLog.mood ? todayLog.mood.charAt(0).toUpperCase() + todayLog.mood.slice(1) : '—'} />
                <DataRow label="Symptoms" value={todayLog.symptoms?.length ? todayLog.symptoms.join(', ') : 'None reported'} />
                <DataRow label="Nutrition" value={todayLog.nutrition === 'on_track' ? 'On Track' : todayLog.nutrition === 'needs_improvement' ? 'Needs Improvement' : todayLog.nutrition === 'poor' ? 'Poor' : '—'} />
              </>
            ) : (
              <p className="text-sm font-medium text-gray-400">You haven't checked in today. <Link href="/dashboard/health" className="text-navy underline underline-offset-2">Log how you're feeling</Link>.</p>
            )}
          </Card>

          {/* Nearest Health Centers */}
          <Card title="Nearest Health Facilities" button={<OutlineBtn href="/dashboard/health-centers">Find Facilities Near Me</OutlineBtn>}>
            <p className="text-sm font-medium text-gray-400 leading-relaxed">
              Locate the nearest hospitals and health centres in your area — with emergency contacts.
            </p>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[8px]">
              <p className="text-xs font-bold text-red-700">For emergencies: go to your nearest hospital — do not wait for your CHW.</p>
            </div>
          </Card>

          {/* Recommended Resources */}
          <Card title="Recommended Resources" button={<OutlineBtn href="/resources">Explore Resources</OutlineBtn>}>
            <p className="text-sm font-medium text-gray-400">
              Evidence-based articles on pregnancy, nutrition, and postnatal care — sourced from Rwanda Ministry of Health and RBC.
            </p>
          </Card>

          {/* My Care Team */}
          <Card title="My Care Team (Abajyanama b'ubuzima)" button={
            chwName
              ? <OutlineBtn href="/dashboard/messages">View Messages from CHW</OutlineBtn>
              : <OutlineBtn href="/dashboard/find-chw">Find a CHW Near You</OutlineBtn>
          }>
            {chwName ? (
              <>
                <DataRow label="Community Health Worker" value={chwName} />
                <DataRow label="Sector" value={[chwProfile?.sector, chwProfile?.district].filter(Boolean).join(', ') || '—'} />
                <p className="text-xs font-medium text-gray-400 mt-3 leading-relaxed">Your CHW (Umujyanama w'ubuzima) will send you care messages and updates through Ndarinzwe.</p>
              </>
            ) : (
              <p className="text-sm font-medium text-gray-400">
                No CHW linked yet. Find a Community Health Worker (Umujyanama w'ubuzima) near you.
              </p>
            )}
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
