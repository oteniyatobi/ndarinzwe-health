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

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const BABY_SIZES = {
  4:'a poppy seed',5:'an apple seed',6:'a pea',7:'a blueberry',8:'a raspberry',
  9:'a grape',10:'a kumquat',11:'a fig',12:'a lime',13:'a lemon',
  14:'a peach',15:'an apple',16:'an avocado',17:'a pear',18:'a mango',
  19:'a tomato',20:'a banana',21:'a carrot',22:'a papaya',23:'a grapefruit',
  24:'a corn cob',25:'a cauliflower',26:'a head of lettuce',27:'a cabbage',
  28:'an eggplant',29:'a butternut squash',30:'a large cabbage',31:'a coconut',
  32:'a jicama',33:'a pineapple',34:'a cantaloupe',35:'a honeydew melon',
  36:'a head of romaine lettuce',37:'a winter melon',38:'a leek',
  39:'a small watermelon',40:'a small pumpkin',
}

function getWeekData(weeks) {
  if (weeks === null) return null
  const w = Math.min(Math.max(weeks, 4), 40)
  const babySize = `About the size of ${BABY_SIZES[w] || BABY_SIZES[40]}`

  if (weeks <= 13) {
    return {
      trimester: 'First Trimester',
      babySize,
      devUpdates: [
        'All major organs are beginning to form',
        'The heart is beating and pumping blood',
        'Tiny fingers and toes are developing',
        'The brain and nervous system are rapidly growing',
      ],
      thisWeek: "Your baby's most critical development is happening now. Every week brings major new milestones in organ and limb formation.",
      bodyChanges: [
        'Breast tenderness and swelling',
        'Nausea and morning sickness (often throughout the day)',
        'Fatigue and increased need for rest',
        'Frequent urination as the uterus grows',
        'Heightened sense of smell',
      ],
    }
  }
  if (weeks <= 26) {
    return {
      trimester: 'Second Trimester',
      babySize,
      devUpdates: [
        "Your baby's hearing is developing and they may begin responding to sound",
        'Arms and legs are moving more actively as muscles continue to strengthen',
        'Bones are becoming harder as growth continues',
        'The skin is still thin and transparent but will thicken soon',
      ],
      thisWeek: 'Your baby is growing quickly and reaching important developmental milestones.',
      bodyChanges: [
        'A growing belly as your baby develops',
        'Increased appetite and changing food preferences',
        'Mild back pain or body discomfort',
        'More noticeable baby movements',
        'Changes in energy levels',
      ],
    }
  }
  return {
    trimester: 'Third Trimester',
    babySize,
    devUpdates: [
      "Baby's lungs are maturing and practicing breathing movements",
      'Baby is gaining weight rapidly — about half a pound per week',
      'The brain is developing rapidly with complex neural connections',
      'Baby is settling into a head-down position in preparation for birth',
    ],
    thisWeek: 'Your baby is fully developed and is mainly gaining weight and strength for birth.',
    bodyChanges: [
      'Shortness of breath as the baby pushes on your diaphragm',
      'Frequent urination as the baby presses on your bladder',
      'Braxton Hicks contractions becoming more noticeable',
      'Swelling in feet and ankles',
      'Difficulty sleeping and finding a comfortable position',
    ],
  }
}

export default function PregnancyJourneyPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [mother, setMother] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('mothers').select('*').eq('id', user.id).single(),
      ])

      if (p?.role === 'chw') { router.push('/dashboard/chw'); return }
      setProfile(p)
      setMother(m)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <LoadingScreen />

  const weeks = calcWeeks(mother?.lmp_date, mother?.due_date)
  const remaining = mother?.due_date
    ? Math.max(0, Math.ceil((new Date(mother.due_date).getTime() - Date.now()) / 604800000))
    : null
  const progressPct = weeks !== null ? Math.min(100, Math.round((weeks / 40) * 100)) : 0
  const data = getWeekData(weeks)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-12">

        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {/* Overview */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-navy mb-8">Pregnancy Journey Overview</h1>

          <p className="text-sm font-bold text-navy mb-3">Current Stage</p>
          <div className="space-y-2 mb-6">
            <InfoRow label="Trimester" value={data?.trimester || '—'} />
            <InfoRow label="Due Date" value={formatDate(mother?.due_date)} />
            <InfoRow label="Remaining" value={remaining !== null ? `${remaining} Weeks` : '—'} />
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="h-2 bg-navy rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-sm font-medium text-gray-500">{progressPct}% Completed</p>
        </section>

        {/* Baby Development */}
        {data && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy mb-6">Baby Development</h2>

            <p className="text-sm font-bold text-navy mb-4">Current Stage</p>

            <p className="text-sm font-bold text-navy/70 mb-1">Baby Size:</p>
            <p className="text-sm text-gray-500 mb-5">{data.babySize}</p>

            <p className="text-sm font-bold text-pink-primary mb-2">Development Updates:</p>
            <ul className="space-y-2 mb-5">
              {data.devUpdates.map((u, i) => (
                <li key={i} className="text-sm text-gray-500">{u}</li>
              ))}
            </ul>

            <p className="text-sm font-bold text-pink-primary mb-1">This Week</p>
            <p className="text-sm text-gray-500">{data.thisWeek}</p>
          </section>
        )}

        {/* Body Changes */}
        {data && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy mb-6">Body Changes</h2>

            <p className="text-sm font-bold text-navy mb-4">Current Stage</p>

            <p className="text-sm font-bold text-pink-primary mb-3">What To Expect</p>
            <ul className="space-y-2">
              {data.bodyChanges.map((c, i) => (
                <li key={i} className="text-sm text-gray-500">{c}</li>
              ))}
            </ul>
          </section>
        )}

        {!data && (
          <p className="text-sm text-gray-400">No pregnancy data found. Please update your profile.</p>
        )}

      </main>

      <Footer />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-navy/70 w-24 shrink-0">{label}:</span>
      <span className="text-sm text-gray-500">{value}</span>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-400">Loading your journey…</p>
      </div>
    </div>
  )
}
