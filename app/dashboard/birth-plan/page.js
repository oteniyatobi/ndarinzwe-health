'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const FACILITIES = [
  'Kigali University Teaching Hospital (CHUK)',
  'Rwanda Military Hospital (RMH)',
  'King Faisal Hospital',
  'Kibagabaga District Hospital',
  'Muhima District Hospital',
  'Masaka District Hospital',
  'Ruhengeri Referral Hospital',
  'Butare University Teaching Hospital (CHUB)',
  'Gitarama District Hospital (Kabgayi)',
  'Byumba District Hospital',
  'Rwamagana District Hospital',
  'Kibungo Referral Hospital',
  'Kabutare District Hospital',
  'Nearest Health Centre',
  'Other',
]

const TRANSPORT = ['Partner / spouse', 'Family member', 'Neighbour', 'Moto taxi', 'Community vehicle', 'Ambulance']
const SUPPORT = ['Partner / spouse', 'Mother', 'Sister', 'Aunt', 'Friend', 'No support person']
const PAIN = ['No pain relief (natural)', 'Breathing techniques', 'Warm water / bath', 'Whatever is available at the facility']
const CORD = ['Partner cuts cord', 'Midwife / doctor cuts cord', 'No preference']

const EMPTY = {
  facility: '',
  transport: '',
  support: '',
  pain_relief: '',
  cord_clamping: '',
  breastfeed_immediately: null,
  skin_to_skin: null,
  bag_checklist: [],
  emergency_contact_name: '',
  emergency_contact_phone: '',
  notes: '',
}

const BAG_ITEMS = [
  'ANC card (antenatal care record)',
  'National ID / Mutuelle card',
  'Clean clothes for mother',
  'Clean clothes for baby (3 sets)',
  'Nappies / cloth nappies',
  'Sanitary pads',
  'Food and water for stay',
  'Prescribed medications',
  'Money for transport and expenses',
  'Phone and charger',
]

export default function BirthPlanPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(EMPTY)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      setProfile(p)
      const stored = localStorage.getItem('ndarinzwe-birth-plan')
      if (stored) setPlan({ ...EMPTY, ...JSON.parse(stored) })
      setLoading(false)
    }
    load()
  }, [router])

  function update(field, value) {
    setPlan(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function toggleChecklist(item) {
    setPlan(prev => {
      const list = prev.bag_checklist || []
      const next = list.includes(item) ? list.filter(i => i !== item) : [...list, item]
      return { ...prev, bag_checklist: next }
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    localStorage.setItem('ndarinzwe-birth-plan', JSON.stringify(plan))
    await new Promise(r => setTimeout(r, 400))
    setSaving(false)
    setSaved(true)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#FFF0F6] px-6 md:px-10 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-navy mb-1">My Birth Plan</h1>
          <p className="text-sm font-medium text-navy/60">
            Plan your delivery in advance — where, who, transport, and what to bring. Share this with your care team.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-6 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {/* Emergency reminder */}
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-[10px]">
          <p className="text-sm font-bold text-red-700 mb-1">Important — In an emergency</p>
          <p className="text-sm font-medium text-red-700">
            If you have heavy bleeding, fits, severe pain, or your baby stops moving — go to the nearest hospital immediately. Do not wait. Call for transport and leave right away.
          </p>
        </div>

        <div className="space-y-8">

          {/* Where */}
          <Section title="1. Where do you plan to give birth?">
            <SelectField label="Health facility" value={plan.facility} onChange={v => update('facility', v)} options={FACILITIES} placeholder="Select a facility" />
          </Section>

          {/* Transport */}
          <Section title="2. How will you get there?">
            <ChoiceGrid value={plan.transport} onChange={v => update('transport', v)} options={TRANSPORT} />
            <p className="text-xs text-gray-400 mt-3">Rwanda MoH recommends arranging transport in advance — especially if the facility is far from home.</p>
          </Section>

          {/* Support */}
          <Section title="3. Who will support you during labour?">
            <ChoiceGrid value={plan.support} onChange={v => update('support', v)} options={SUPPORT} />
          </Section>

          {/* Pain relief */}
          <Section title="4. Pain relief preferences">
            <ChoiceGrid value={plan.pain_relief} onChange={v => update('pain_relief', v)} options={PAIN} />
          </Section>

          {/* After birth */}
          <Section title="5. After birth">
            <YesNo label="Skin-to-skin contact immediately after birth" value={plan.skin_to_skin} onChange={v => update('skin_to_skin', v)} />
            <YesNo label="Start breastfeeding within the first hour of birth" value={plan.breastfeed_immediately} onChange={v => update('breastfeed_immediately', v)} />
            <SelectField label="Cord clamping" value={plan.cord_clamping} onChange={v => update('cord_clamping', v)} options={CORD} placeholder="Select preference" />
          </Section>

          {/* Emergency contacts */}
          <Section title="6. Emergency contacts">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Contact name</label>
                <input value={plan.emergency_contact_name} onChange={e => update('emergency_contact_name', e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-navy transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">Phone number</label>
                <input value={plan.emergency_contact_phone} onChange={e => update('emergency_contact_phone', e.target.value)}
                  placeholder="+250 7xx xxx xxx" type="tel"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-navy transition-colors" />
              </div>
            </div>
          </Section>

          {/* Bag checklist */}
          <Section title="7. Delivery bag checklist">
            <p className="text-xs text-gray-400 mb-3">Tick off items as you pack them. Prepare your bag at least 4 weeks before your due date.</p>
            <div className="space-y-2">
              {BAG_ITEMS.map(item => (
                <label key={item} className="flex items-center gap-3 py-2 px-3 border border-gray-100 rounded-[8px] cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" checked={plan.bag_checklist?.includes(item) || false}
                    onChange={() => toggleChecklist(item)}
                    className="w-4 h-4 accent-navy flex-shrink-0" />
                  <span className={`text-sm font-medium ${plan.bag_checklist?.includes(item) ? 'text-gray-400 line-through' : 'text-navy'}`}>{item}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Notes */}
          <Section title="8. Additional notes or wishes">
            <textarea value={plan.notes} onChange={e => update('notes', e.target.value)}
              placeholder="Any other wishes, medical notes, or things you want your care team to know…"
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-navy transition-colors resize-none" />
          </Section>

        </div>

        <div className="mt-8 flex items-center gap-4">
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-3.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 disabled:opacity-60 transition-opacity">
            {saving ? 'Saving…' : 'Save Birth Plan'}
          </button>
          {saved && <p className="text-sm font-medium text-green-600">Saved successfully.</p>}
        </div>

        <p className="mt-4 text-xs text-gray-400">Your birth plan is saved on this device. Share it with your Community Health Worker or health facility during your next visit.</p>
      </main>

      <Footer />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="border border-gray-200 rounded-[10px] p-5">
      <h2 className="text-sm font-bold text-navy mb-4">{title}</h2>
      {children}
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-navy mb-1.5">{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-[8px] text-sm text-navy bg-white focus:outline-none focus:border-navy transition-colors">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function ChoiceGrid({ value, onChange, options }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} type="button"
          className={`py-2.5 px-4 rounded-[8px] text-sm font-medium text-left transition-colors border ${value === o ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray-200 hover:border-navy/40'}`}>
          {o}
        </button>
      ))}
    </div>
  )
}

function YesNo({ label, value, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-navy mb-2">{label}</p>
      <div className="flex gap-3">
        {[true, false].map(v => (
          <button key={String(v)} onClick={() => onChange(v)} type="button"
            className={`px-5 py-2 rounded-[8px] text-sm font-medium border transition-colors ${value === v ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray-200 hover:border-navy/40'}`}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}
