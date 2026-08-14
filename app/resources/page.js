'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const RESOURCES = [
  {
    category: 'Antenatal Care',
    image: '/images/istockphoto-182505788-612x612.webp',
    imageAlt: 'Pregnant mother holding her belly',
    items: [
      {
        title: 'Focused Antenatal Care in Rwanda',
        source: 'Rwanda Biomedical Centre (RBC)',
        description: 'Guidelines for antenatal visits, timing, and what to expect at each appointment.',
        url: 'https://www.rbc.gov.rw',
      },
      {
        title: 'Pregnancy Danger Signs',
        source: 'Rwanda Ministry of Health',
        description: 'Warning signs during pregnancy that require immediate medical attention.',
        url: 'https://www.moh.gov.rw',
      },
      {
        title: 'Iron and Folic Acid Supplementation',
        source: 'Rwanda Ministry of Health',
        description: 'Why iron and folic acid matter during pregnancy and how to take them.',
        url: 'https://www.moh.gov.rw',
      },
    ],
  },
  {
    category: 'Nutrition in Pregnancy',
    image: '/images/Animated SVJ 3.jpg',
    imageAlt: 'Mother reading nutrition information',
    items: [
      {
        title: 'Nutrition During Pregnancy',
        source: 'Rwanda Ministry of Health',
        description: 'Foods to eat and avoid, portion sizes, and staying hydrated during pregnancy.',
        url: 'https://www.moh.gov.rw',
      },
      {
        title: 'Prevention of Malnutrition in Mothers and Children',
        source: 'Rwanda Biomedical Centre (RBC)',
        description: 'Community-based nutrition guidelines for pregnant and breastfeeding mothers.',
        url: 'https://www.rbc.gov.rw',
      },
    ],
  },
  {
    category: 'Labour & Delivery',
    image: '/images/Pregnant mother 1.avif',
    imageAlt: 'Pregnant mother preparing for childbirth',
    items: [
      {
        title: 'Preparing for Labour and Childbirth',
        source: 'Rwanda Ministry of Health',
        description: 'What to expect during labour, when to go to the health facility, and birth planning.',
        url: 'https://www.moh.gov.rw',
      },
      {
        title: 'Emergency Obstetric Care in Rwanda',
        source: 'Rwanda Biomedical Centre (RBC)',
        description: 'Referral pathways and emergency obstetric services available across Rwanda.',
        url: 'https://www.rbc.gov.rw',
      },
    ],
  },
  {
    category: 'Postnatal Care',
    image: '/images/Animated SVJ 1.jpg',
    imageAlt: 'Mother after giving birth',
    items: [
      {
        title: 'Postnatal Care for Mothers and Newborns',
        source: 'Rwanda Ministry of Health',
        description: 'Care in the first 6 weeks after birth — danger signs, breastfeeding, and recovery.',
        url: 'https://www.moh.gov.rw',
      },
      {
        title: 'Immunisation Schedule in Rwanda',
        source: 'Rwanda Biomedical Centre (RBC)',
        description: "Rwanda's vaccination schedule for newborns and infants in the first year.",
        url: 'https://www.rbc.gov.rw',
      },
    ],
  },
  {
    category: 'Mental Health',
    image: '/images/Animated SVJ 2.jpg',
    imageAlt: 'Mother seeking support and connection',
    items: [
      {
        title: 'Mental Health During and After Pregnancy',
        source: 'Rwanda Ministry of Health',
        description: 'Recognising and managing anxiety, depression and stress during pregnancy.',
        url: 'https://www.moh.gov.rw',
      },
    ],
  },
]

const CATEGORY_COLORS = [
  'bg-pink-50 text-pink-700',
  'bg-green-50 text-green-700',
  'bg-blue-50 text-blue-700',
  'bg-purple-50 text-purple-700',
  'bg-amber-50 text-amber-700',
]

export default function ResourcesPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
      setProfile(p)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const dashHref = profile?.role === 'chw' ? '/dashboard/chw' : '/dashboard'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader name={profile?.full_name} />

      <section className="bg-[#FFF0F6] px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-navy mb-1">Health Resources</h1>
          <p className="text-sm font-medium text-navy/60">
            Evidence-based information from Rwanda Ministry of Health and Rwanda Biomedical Centre.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-10">
        <Link href={dashHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Dashboard
        </Link>

        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[8px]">
          <p className="text-sm font-medium text-amber-800">
            All resources on this page link to official Rwanda Ministry of Health (moh.gov.rw) and Rwanda Biomedical Centre (rbc.gov.rw) websites. Always consult your doctor or Community Health Worker for personal medical advice.
          </p>
        </div>

        <div className="space-y-10">
          {RESOURCES.map((section, si) => (
            <div key={section.category}>
              {/* Category header with image */}
              <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-[12px] border border-gray-100">
                <img
                  src={section.image}
                  alt={section.imageAlt}
                  className="w-16 h-16 rounded-[8px] object-cover shrink-0"
                />
                <div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[si % CATEGORY_COLORS.length]}`}>
                    {section.category}
                  </span>
                  <p className="text-xs text-gray-400 mt-1.5">{section.items.length} article{section.items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-3">
                {section.items.map(item => (
                  <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="block p-5 border border-gray-200 rounded-[10px] hover:border-navy/40 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-navy mb-1 group-hover:text-pink-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs font-medium text-gray-400 mb-2">{item.source}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        className="text-navy/30 group-hover:text-navy shrink-0 mt-1 transition-colors">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
