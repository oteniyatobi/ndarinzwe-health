'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const NAMES = [
  // Girls
  { name: 'Amahoro',   gender: 'girl',   meaning: 'Peace' },
  { name: 'Akaliza',   gender: 'girl',   meaning: 'Something that has grown to blossom' },
  { name: 'Akimana',   gender: 'girl',   meaning: 'Given by God' },
  { name: 'Cyuzuzo',   gender: 'girl',   meaning: 'Fulfilled' },
  { name: 'Gahongayire', gender: 'girl', meaning: 'She came without a gift but brought herself' },
  { name: 'Igiraneza',  gender: 'girl',  meaning: 'Source of goodness' },
  { name: 'Ingabire',   gender: 'girl',  meaning: 'Gift' },
  { name: 'Ineza',      gender: 'girl',  meaning: 'Goodness / kindness' },
  { name: 'Ishimwe',    gender: 'girl',  meaning: 'Praise / thanks to God' },
  { name: 'Kabatesi',   gender: 'girl',  meaning: 'Child of happy times' },
  { name: 'Kagoyire',   gender: 'girl',  meaning: 'She is loved and cherished' },
  { name: 'Keza',       gender: 'girl',  meaning: 'Beautiful / goodness' },
  { name: 'Mutoni',     gender: 'girl',  meaning: 'Gentleness' },
  { name: 'Mwiza',      gender: 'girl',  meaning: 'Beautiful one' },
  { name: 'Ndagijimana', gender: 'girl', meaning: 'I rely on God' },
  { name: 'Nikuze',     gender: 'girl',  meaning: 'She has grown' },
  { name: 'Nininahazwe', gender: 'girl', meaning: 'Wonder of God' },
  { name: 'Niyomukiza', gender: 'girl',  meaning: 'God saves' },
  { name: 'Niyonsaba',  gender: 'girl',  meaning: 'What we asked of God' },
  { name: 'Nzamwita',   gender: 'girl',  meaning: 'I call upon God' },
  { name: 'Umutoni',    gender: 'girl',  meaning: 'Gentle one' },
  { name: 'Umutesi',    gender: 'girl',  meaning: 'One who brings happiness' },
  { name: 'Uwera',      gender: 'girl',  meaning: 'Pure / holy one' },
  { name: 'Uwimana',    gender: 'girl',  meaning: 'She belongs to God' },
  { name: 'Uwineza',    gender: 'girl',  meaning: 'She is the good one' },
  // Boys
  { name: 'Aime',       gender: 'boy',   meaning: 'Loved / beloved' },
  { name: 'Aloys',      gender: 'boy',   meaning: 'Noble warrior' },
  { name: 'Bigirindavyi', gender: 'boy', meaning: 'One who goes forward in life' },
  { name: 'Bizimana',   gender: 'boy',   meaning: 'God knows' },
  { name: 'Cyubahiro',  gender: 'boy',   meaning: 'Honour / respect' },
  { name: 'Gashumba',   gender: 'boy',   meaning: 'Wealth / abundance' },
  { name: 'Habimana',   gender: 'boy',   meaning: 'God exists' },
  { name: 'Hakizimana', gender: 'boy',   meaning: 'Only God saves' },
  { name: 'Hirwa',      gender: 'boy',   meaning: 'Lucky / fortunate' },
  { name: 'Hishamana',  gender: 'boy',   meaning: 'God is great' },
  { name: 'Imbabazi',   gender: 'boy',   meaning: 'Mercy / grace' },
  { name: 'Inzabirinda', gender: 'boy',  meaning: 'Fast as an arrow' },
  { name: 'Ishimwe',    gender: 'boy',   meaning: 'Praise / thanks to God' },
  { name: 'Kalisa',     gender: 'boy',   meaning: 'One who is pure' },
  { name: 'Maniriho',   gender: 'boy',   meaning: 'God is above all' },
  { name: 'Mugabo',     gender: 'boy',   meaning: 'Man / hero' },
  { name: 'Muneza',     gender: 'boy',   meaning: 'The good one' },
  { name: 'Munyaneza',  gender: 'boy',   meaning: 'Son of goodness' },
  { name: 'Musoni',     gender: 'boy',   meaning: 'Born at the time of sowing' },
  { name: 'Mutabazi',   gender: 'boy',   meaning: 'Saviour / rescuer' },
  { name: 'Ndayishimiye', gender: 'boy', meaning: 'I am thankful to God' },
  { name: 'Nkurunziza', gender: 'boy',   meaning: 'God is good and fair' },
  { name: 'Nsabimana',  gender: 'boy',   meaning: 'I pray to God' },
  { name: 'Ntwari',     gender: 'boy',   meaning: 'Brave / hero' },
  { name: 'Rugamba',    gender: 'boy',   meaning: 'Bold fighter' },
  { name: 'Ruhamanya',  gender: 'boy',   meaning: 'God knows everything' },
  { name: 'Shema',      gender: 'boy',   meaning: 'Pride / glory' },
  { name: 'Sibomana',   gender: 'boy',   meaning: 'There is still God' },
  { name: 'Tuyishime',  gender: 'boy',   meaning: 'Let us praise Him' },
  { name: 'Twizeyimana', gender: 'boy',  meaning: 'We trust in God' },
  // Unisex
  { name: 'Amani',      gender: 'unisex', meaning: 'Peace (Swahili / Kinyarwanda)' },
  { name: 'Ishimwe',    gender: 'unisex', meaning: 'Praise / thanks' },
  { name: 'Neza',       gender: 'unisex', meaning: 'Goodness / beauty' },
]

export default function BabyNamesPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [saved, setSaved] = useState([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      setProfile(p)
      const stored = localStorage.getItem('saved-baby-names')
      if (stored) setSaved(JSON.parse(stored))
      setLoading(false)
    }
    load()
  }, [router])

  function toggleSave(name) {
    setSaved(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
      localStorage.setItem('saved-baby-names', JSON.stringify(next))
      return next
    })
  }

  const filtered = NAMES.filter(n => {
    const matchGender = filter === 'all' || n.gender === filter
    const matchSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.meaning.toLowerCase().includes(search.toLowerCase())
    return matchGender && matchSearch
  })

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
          <h1 className="text-3xl font-bold text-navy mb-1">Rwandan Baby Names</h1>
          <p className="text-sm font-medium text-navy/60">
            Browse meaningful Kinyarwanda names for your baby — with their meanings.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-6 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search names or meanings…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-navy transition-colors"
          />
          <div className="flex gap-2">
            {['all', 'girl', 'boy', 'unisex'].map(g => (
              <button key={g} onClick={() => setFilter(g)}
                className={`px-4 py-2.5 rounded-[8px] text-xs font-bold capitalize transition-colors ${filter === g ? 'bg-navy text-white' : 'bg-gray-100 text-navy hover:bg-gray-200'}`}>
                {g === 'all' ? 'All' : g === 'girl' ? 'Girls' : g === 'boy' ? 'Boys' : 'Unisex'}
              </button>
            ))}
          </div>
        </div>

        {/* Saved names */}
        {saved.length > 0 && (
          <div className="mb-8 p-4 bg-pink-primary/10 rounded-[10px]">
            <p className="text-xs font-bold text-navy mb-2">Saved Names ({saved.length})</p>
            <div className="flex flex-wrap gap-2">
              {saved.map(n => (
                <span key={n} className="px-3 py-1 bg-white border border-pink-primary/30 rounded-full text-xs font-bold text-navy">
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Name grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(n => (
            <div key={n.name + n.gender}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-[10px] hover:border-navy/30 transition-colors">
              <div>
                <p className="text-sm font-bold text-navy">{n.name}</p>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{n.meaning}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${n.gender === 'girl' ? 'bg-pink-50 text-pink-600' : n.gender === 'boy' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {n.gender === 'girl' ? 'Girl' : n.gender === 'boy' ? 'Boy' : 'Unisex'}
                </span>
              </div>
              <button onClick={() => toggleSave(n.name)}
                className={`p-2 rounded-full transition-colors ${saved.includes(n.name) ? 'text-pink-primary' : 'text-gray-300 hover:text-gray-500'}`}
                aria-label={saved.includes(n.name) ? 'Remove from saved' : 'Save name'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={saved.includes(n.name) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-12">No names found for that search.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}
