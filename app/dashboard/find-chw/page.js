'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'
import { DISTRICTS, getSectors } from '@/lib/rwanda-locations'

function DistanceBadge({ km }) {
  if (!km) return null
  return (
    <span className="text-xs font-medium text-navy/60">{km} km away</span>
  )
}

function ChwCard({ chw, linkedChwId, onLink, linking }) {
  const isLinked = linkedChwId === chw.id
  return (
    <div className={`p-5 border rounded-[10px] transition-all ${isLinked ? 'border-navy bg-navy/5' : 'border-gray-200 hover:border-navy/40'}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-navy">{chw.full_name}</p>
            {isLinked && <span className="text-xs font-bold text-white bg-navy px-2 py-0.5 rounded-full">Your CHW</span>}
          </div>
          <p className="text-xs text-gray-400">Code: {chw.chw_code}</p>
        </div>
        {chw.distance_km !== undefined && <DistanceBadge km={chw.distance_km} />}
      </div>
      <div className="space-y-1 mb-4">
        <p className="text-xs text-gray-500"><span className="font-medium text-navy">Sector:</span> {chw.sector}, {chw.district}</p>
        {chw.health_facility && <p className="text-xs text-gray-500"><span className="font-medium text-navy">Facility:</span> {chw.health_facility}</p>}
      </div>
      <button
        onClick={() => onLink(chw.id)}
        disabled={isLinked || linking === chw.id}
        className={`w-full py-2 text-sm font-bold rounded-[5px] transition-all ${isLinked ? 'bg-transparent border border-navy/30 text-navy/40 cursor-not-allowed' : 'bg-navy text-white hover:opacity-90'} disabled:opacity-60`}
      >
        {linking === chw.id ? 'Linking…' : isLinked ? 'Currently linked' : 'Link to this CHW'}
      </button>
    </div>
  )
}

export default function FindChwPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [motherId, setMotherId] = useState(null)
  const [linkedChwId, setLinkedChwId] = useState(null)
  const [chws, setChws] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [linking, setLinking] = useState(null)
  const [mode, setMode] = useState('text') // 'text' | 'gps'
  const [district, setDistrict] = useState('')
  const [sector, setSector] = useState('')
  const [chwCode, setChwCode] = useState('')
  const [gpsError, setGpsError] = useState('')
  const [linked, setLinked] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('mothers').select('id, linked_chw_id').eq('id', user.id).single(),
      ])
      if (p?.role === 'chw') { router.push('/dashboard/chw'); return }
      setProfile(p)
      if (m) {
        setMotherId(m.id)
        setLinkedChwId(m.linked_chw_id)
        if (m.district) setDistrict(m.district)
        if (m.sector) setSector(m.sector)
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function searchByText(e) {
    e.preventDefault()
    setSearching(true); setError(''); setChws([])
    const supabase = createClient()

    let q = supabase
      .from('chws')
      .select('id, chw_code, sector, district, health_facility, profiles(full_name)')

    if (chwCode.trim()) {
      q = q.ilike('chw_code', `%${chwCode.trim()}%`)
    } else {
      if (district) q = q.eq('district', district)
      if (sector.trim()) q = q.ilike('sector', `%${sector.trim()}%`)
    }

    const { data, error: err } = await q.limit(20)
    if (err || !data?.length) {
      setError('No CHWs found. Try broadening your search.')
    } else {
      setChws(data.map(c => ({ ...c, full_name: c.profiles?.full_name || 'CHW' })))
    }
    setSearching(false)
  }

  async function searchByGps() {
    setGpsError(''); setSearching(true); setChws([])
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported on this device.')
      setSearching(false); return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const supabase = createClient()
        const { data, error: err } = await supabase.rpc('find_nearby_chws', {
          user_lat: pos.coords.latitude,
          user_lng: pos.coords.longitude,
          radius_km: 20,
        })
        if (err || !data?.length) {
          setGpsError('No CHWs found within 20 km. Try a text search instead.')
        } else {
          setChws(data.map(c => ({ ...c, full_name: c.full_name || 'CHW' })))
        }
        setSearching(false)
      },
      (err) => {
        setGpsError('Location access denied. Please allow location access or use text search.')
        setSearching(false)
      }
    )
  }

  async function handleLink(chwId) {
    setLinking(chwId)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('mothers')
      .update({ linked_chw_id: chwId })
      .eq('id', motherId)
    if (!err) { setLinkedChwId(chwId); setLinked(true) }
    setLinking(null)
  }

  if (loading) return <Loading label="Loading…" />

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#FFF0F6] px-6 md:px-10 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-navy mb-1">Find a Community Health Worker</h1>
          <p className="text-sm font-medium text-navy/60">
            Connect with a CHW in your area for personalised home support.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {linked && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-[8px]">
            <p className="text-sm font-medium text-green-700">
              ✓ CHW linked successfully! They can now see your profile and send you messages.
            </p>
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('text')}
            className={`px-4 py-2 text-sm font-bold rounded-[5px] transition-all ${mode === 'text' ? 'bg-navy text-white' : 'border border-gray-200 text-navy hover:border-navy/40'}`}>
            Search by location
          </button>
          <button onClick={() => { setMode('gps'); setChws([]); setError('') }}
            className={`px-4 py-2 text-sm font-bold rounded-[5px] transition-all ${mode === 'gps' ? 'bg-navy text-white' : 'border border-gray-200 text-navy hover:border-navy/40'}`}>
            Use my GPS location
          </button>
        </div>

        {/* Text search */}
        {mode === 'text' && (
          <form onSubmit={searchByText} className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">District</label>
                <select value={district} onChange={e => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-[5px] text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy bg-white">
                  <option value="">All districts</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">Sector</label>
                <select value={sector} onChange={e => setSector(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-[5px] text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy bg-white">
                  <option value="">{district ? 'All sectors' : 'Choose district first'}</option>
                  {getSectors(district).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy/60 mb-1.5">CHW Code</label>
                <input value={chwCode} onChange={e => setChwCode(e.target.value)}
                  placeholder="e.g. RW-0012"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-[5px] text-sm text-black focus:outline-none focus:ring-2 focus:ring-navy bg-white" />
              </div>
            </div>
            <button type="submit" disabled={searching}
              className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 disabled:opacity-60 transition-opacity">
              {searching ? 'Searching…' : 'Search'}
            </button>
          </form>
        )}

        {/* GPS search */}
        {mode === 'gps' && (
          <div className="mb-8">
            <button onClick={searchByGps} disabled={searching}
              className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 disabled:opacity-60 transition-opacity">
              {searching ? 'Getting location…' : 'Find CHWs near me'}
            </button>
            {gpsError && <p className="mt-3 text-sm font-medium text-red-500">{gpsError}</p>}
          </div>
        )}

        {error && <p className="text-sm text-gray-400 mb-6">{error}</p>}

        {chws.length > 0 && (
          <div>
            <p className="text-sm font-bold text-navy mb-4">{chws.length} CHW{chws.length !== 1 ? 's' : ''} found</p>
            <div className="space-y-4">
              {chws.map(chw => (
                <ChwCard key={chw.id} chw={chw} linkedChwId={linkedChwId} onLink={handleLink} linking={linking} />
              ))}
            </div>
          </div>
        )}
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
