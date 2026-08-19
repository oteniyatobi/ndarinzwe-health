'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const HOSPITALS = [
  { name: 'CHUK – Kigali University Teaching Hospital', type: 'Referral Hospital', district: 'Nyarugenge, Kigali', phone: '+250 252 575 555', lat: -1.9536, lng: 30.0606, emergency: true },
  { name: 'Rwanda Military Hospital (RMH)', type: 'Referral Hospital', district: 'Kicukiro, Kigali', phone: '+250 252 597 890', lat: -1.9927, lng: 30.0844, emergency: true },
  { name: 'King Faisal Hospital', type: 'Referral Hospital', district: 'Gasabo, Kigali', phone: '+250 252 582 421', lat: -1.9320, lng: 30.0906, emergency: true },
  { name: 'Kibagabaga District Hospital', type: 'District Hospital', district: 'Gasabo, Kigali', phone: '+250 252 580 524', lat: -1.9131, lng: 30.1189, emergency: true },
  { name: 'Muhima District Hospital', type: 'District Hospital', district: 'Nyarugenge, Kigali', phone: '+250 252 572 127', lat: -1.9536, lng: 30.0475, emergency: true },
  { name: 'Masaka District Hospital', type: 'District Hospital', district: 'Kicukiro, Kigali', phone: '+250 252 584 615', lat: -2.0263, lng: 30.1011, emergency: true },
  { name: 'Ruhengeri Referral Hospital', type: 'Referral Hospital', district: 'Musanze, Northern', phone: '+250 252 546 328', lat: -1.4978, lng: 29.6337, emergency: true },
  { name: 'CHUB – Butare University Teaching Hospital', type: 'Referral Hospital', district: 'Huye, Southern', phone: '+250 252 530 400', lat: -2.5960, lng: 29.7353, emergency: true },
  { name: 'Kabgayi District Hospital', type: 'District Hospital', district: 'Muhanga, Southern', phone: '+250 252 562 219', lat: -2.0824, lng: 29.7533, emergency: true },
  { name: 'Byumba District Hospital', type: 'District Hospital', district: 'Gicumbi, Northern', phone: '+250 252 564 049', lat: -1.5780, lng: 30.0620, emergency: true },
  { name: 'Rwamagana District Hospital', type: 'District Hospital', district: 'Rwamagana, Eastern', phone: '+250 252 567 026', lat: -1.9484, lng: 30.4343, emergency: true },
  { name: 'Kibungo Referral Hospital', type: 'Referral Hospital', district: 'Ngoma, Eastern', phone: '+250 252 566 016', lat: -2.1596, lng: 30.5450, emergency: true },
  { name: 'Kabutare District Hospital', type: 'District Hospital', district: 'Nyanza, Southern', phone: '+250 252 536 004', lat: -2.3511, lng: 29.7320, emergency: true },
  { name: 'Gisenyi District Hospital', type: 'District Hospital', district: 'Rubavu, Western', phone: '+250 252 540 427', lat: -1.7026, lng: 29.2551, emergency: true },
  { name: 'Kibuye District Hospital', type: 'District Hospital', district: 'Karongi, Western', phone: '+250 252 568 021', lat: -2.0611, lng: 29.3474, emergency: true },
]

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function HealthCentersPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      setProfile(p)
      setLoading(false)
    }
    load()
  }, [router])

  function findNearest() {
    if (!navigator.geolocation) {
      setLocError('Your browser does not support location access.')
      return
    }
    setLocLoading(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocLoading(false)
      },
      () => {
        setLocError('Could not get your location. Please allow location access and try again.')
        setLocLoading(false)
      },
      { timeout: 10000 }
    )
  }

  const withDistance = HOSPITALS.map(h => ({
    ...h,
    distance: location ? haversineKm(location.lat, location.lng, h.lat, h.lng) : null,
  }))

  const sorted = location
    ? [...withDistance].sort((a, b) => a.distance - b.distance)
    : withDistance

  const filtered = sorted.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.district.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#FFF0F6] px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-navy mb-1">Nearest Health Facilities</h1>
          <p className="text-sm font-medium text-navy/60">
            Rwanda hospitals and referral centres with 24-hour maternity services.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-6 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {/* Emergency banner */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[10px]">
          <p className="text-sm font-bold text-red-700 mb-1">In an emergency — go immediately</p>
          <p className="text-sm font-medium text-red-700">
            Heavy bleeding, fits, severe pain, baby not moving — go to the nearest hospital right now. Do not wait for your CHW. Call for transport and leave immediately.
          </p>
        </div>

        {/* Location finder */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or district…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-navy transition-colors" />
          <button onClick={findNearest} disabled={locLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-[8px] hover:opacity-90 disabled:opacity-60 transition-opacity whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
            {locLoading ? 'Finding location…' : location ? 'Re-sort by distance' : 'Sort by distance from me'}
          </button>
        </div>

        {locError && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[8px]">
            <p className="text-sm font-medium text-amber-800">{locError}</p>
          </div>
        )}

        {location && (
          <p className="text-xs font-medium text-green-700 mb-4">
            Location found — showing hospitals sorted by distance from you.
          </p>
        )}

        {/* Hospital list */}
        <div className="space-y-3">
          {filtered.map((h, i) => (
            <div key={h.name} className={`p-5 border rounded-[10px] ${i === 0 && location ? 'border-navy/30 bg-navy/5' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold text-navy">{h.name}</p>
                    {i === 0 && location && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-navy text-white rounded-full">Nearest</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-400 mb-1">{h.type} · {h.district}</p>
                  {h.distance !== null && (
                    <p className="text-xs font-bold text-pink-primary mb-2">{h.distance.toFixed(1)} km away</p>
                  )}
                  <a href={`tel:${h.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-pink-primary transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                    {h.phone}
                  </a>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 px-4 py-2 border border-navy text-navy text-xs font-bold rounded-[6px] hover:bg-navy hover:text-white transition-colors whitespace-nowrap">
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400">
          This list covers Rwanda's main referral and district hospitals. For the full list of health centres in your area, ask your Community Health Worker (Umujyanama w'ubuzima) or visit your nearest district hospital.
        </p>
      </main>

      <Footer />
    </div>
  )
}
