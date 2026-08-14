'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const MOODS = [
  { value: 'great', label: 'Great', emoji: '😊' },
  { value: 'good',  label: 'Good',  emoji: '🙂' },
  { value: 'okay',  label: 'Okay',  emoji: '😐' },
  { value: 'poor',  label: 'Poor',  emoji: '😔' },
  { value: 'bad',   label: 'Bad',   emoji: '😢' },
]

const SYMPTOMS = [
  'Nausea', 'Fatigue', 'Back pain', 'Headache',
  'Swelling (hands/feet)', 'Heartburn', 'Shortness of breath',
  'Abdominal discomfort', 'Reduced baby movement', 'None',
]

const NUTRITION = [
  { value: 'on_track',          label: 'On Track',          desc: 'Eating well and staying hydrated' },
  { value: 'needs_improvement', label: 'Needs Improvement', desc: 'Missing some meals or food groups' },
  { value: 'poor',              label: 'Poor',              desc: 'Struggling to eat properly' },
]

function today() { return new Date().toISOString().split('T')[0] }
function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-[5px] text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent bg-white'

export default function HealthPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [motherId, setMotherId] = useState(null)
  const [todayLog, setTodayLog] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  const [mood, setMood] = useState('')
  const [symptoms, setSymptoms] = useState([])
  const [nutrition, setNutrition] = useState('')
  const [notes, setNotes] = useState('')

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
        const [{ data: tl }, { data: hist }] = await Promise.all([
          supabase.from('health_logs').select('*').eq('mother_id', m.id).eq('logged_date', today()).single(),
          supabase.from('health_logs').select('*').eq('mother_id', m.id)
            .neq('logged_date', today()).order('logged_date', { ascending: false }).limit(7),
        ])
        if (tl) {
          setTodayLog(tl)
          setMood(tl.mood || '')
          setSymptoms(tl.symptoms || [])
          setNutrition(tl.nutrition || '')
          setNotes(tl.notes || '')
        }
        setHistory(hist || [])
      }
      setLoading(false)
    }
    load()
  }, [router])

  function toggleSymptom(s) {
    if (s === 'None') { setSymptoms(['None']); return }
    setSymptoms(prev => {
      const without = prev.filter(x => x !== 'None')
      return without.includes(s) ? without.filter(x => x !== s) : [...without, s]
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!mood) { setError('Please select your mood.'); return }
    if (!nutrition) { setError('Please rate your nutrition.'); return }
    setSaving(true); setError('')

    const supabase = createClient()
    const payload = { mother_id: motherId, logged_date: today(), mood, symptoms, nutrition, notes: notes.trim() || null }

    let result
    if (todayLog) {
      const { data } = await supabase.from('health_logs').update(payload).eq('id', todayLog.id).select().single()
      result = data
    } else {
      const { data } = await supabase.from('health_logs').insert(payload).select().single()
      result = data
    }

    if (result) { setTodayLog(result); setSaved(true); setEditing(false) }
    setSaving(false)
  }

  if (loading) return <Loading label="Loading your health log…" />

  const showForm = !todayLog || editing

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#FFF0F6] px-6 md:px-10 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-navy mb-1">My Health Overview</h1>
          <p className="text-sm font-medium text-navy/60">
            {fmtDate(today())} — daily check-in to track how you're feeling.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {/* Today's log (already submitted) */}
        {todayLog && !editing && (
          <div className="mb-10 p-6 border border-gray-200 rounded-[10px]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-navy">Today's Check-In</h2>
              <button onClick={() => { setEditing(true); setSaved(false) }}
                className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
                Update
              </button>
            </div>
            <LogView log={todayLog} />
            {saved && <p className="mt-3 text-sm font-medium text-green-600">✓ Check-in saved successfully.</p>}
          </div>
        )}

        {/* Check-in form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-10 space-y-8">
            <div>
              <h2 className="text-base font-bold text-navy mb-1">
                {todayLog ? 'Update Today\'s Check-In' : 'Today\'s Check-In'}
              </h2>
              <p className="text-sm text-gray-400">{fmtDate(today())}</p>
            </div>

            {/* Mood */}
            <div>
              <p className="text-sm font-bold text-navy mb-3">How are you feeling today? *</p>
              <div className="flex gap-3 flex-wrap">
                {MOODS.map(m => (
                  <button key={m.value} type="button" onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center px-4 py-3 border rounded-[10px] transition-all min-w-[70px] ${mood === m.value ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-navy/40'}`}>
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <span className="text-xs font-medium text-navy">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <p className="text-sm font-bold text-navy mb-3">Any symptoms today?</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSymptom(s)}
                    className={`px-3 py-2 border rounded-[5px] text-sm font-medium transition-all ${symptoms.includes(s) ? 'border-navy bg-navy text-white' : 'border-gray-200 text-navy hover:border-navy/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition */}
            <div>
              <p className="text-sm font-bold text-navy mb-3">How is your nutrition today? *</p>
              <div className="space-y-2">
                {NUTRITION.map(n => (
                  <label key={n.value} className={`flex items-start gap-3 p-4 border rounded-[10px] cursor-pointer transition-all ${nutrition === n.value ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-navy/40'}`}>
                    <input type="radio" name="nutrition" value={n.value} checked={nutrition === n.value} onChange={() => setNutrition(n.value)} className="mt-0.5 accent-navy" />
                    <div>
                      <p className="text-sm font-bold text-navy">{n.label}</p>
                      <p className="text-xs text-gray-400">{n.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-navy mb-2">Additional notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={3} placeholder="Anything else you want to note about how you're feeling…"
                className={`${inputCls} resize-none`} />
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <div className="flex gap-3">
              {editing && (
                <button type="button" onClick={() => setEditing(false)}
                  className="px-5 py-3 border border-gray-300 text-sm font-bold text-navy rounded-[5px] hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={saving}
                className="flex-1 sm:flex-none sm:px-8 py-3 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 disabled:opacity-60 transition-opacity">
                {saving ? 'Saving…' : todayLog ? 'Update Check-In' : 'Submit Check-In'}
              </button>
            </div>
          </form>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-navy mb-4">Recent History</h2>
            <div className="space-y-3">
              {history.map(log => (
                <div key={log.id} className="p-5 border border-gray-100 rounded-[10px]">
                  <p className="text-xs font-bold text-navy/50 mb-3">{fmtDate(log.logged_date)}</p>
                  <LogView log={log} compact />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function LogView({ log, compact }) {
  const mood = MOODS.find(m => m.value === log.mood)
  const nutr = NUTRITION.find(n => n.value === log.nutrition)
  return (
    <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center gap-2">
        <span className="font-bold text-navy">Mood:</span>
        <span className="text-gray-500">{mood ? `${mood.emoji} ${mood.label}` : '—'}</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="font-bold text-navy shrink-0">Symptoms:</span>
        <span className="text-gray-500">{log.symptoms?.length ? log.symptoms.join(', ') : 'None reported'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-navy">Nutrition:</span>
        <span className="text-gray-500">{nutr?.label || '—'}</span>
      </div>
      {log.notes && (
        <div className="flex items-start gap-2">
          <span className="font-bold text-navy shrink-0">Notes:</span>
          <span className="text-gray-500">{log.notes}</span>
        </div>
      )}
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
