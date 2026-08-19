'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const RESOURCES = [
  {
    category: 'Antenatal Care',
    image: '/images/istockphoto-182505788-612x612.webp',
    imageAlt: 'Pregnant mother holding her belly',
    items: [
      {
        title: 'Understanding Warning Signs During Pregnancy',
        source: 'Rwanda Ministry of Health',
        description: 'Warning signs during pregnancy that require immediate medical attention — and when to go to the health facility.',
        slug: 'understanding-warning-signs',
      },
      {
        title: 'Managing Common Pregnancy Symptoms',
        source: 'Rwanda Ministry of Health',
        description: 'Common pregnancy discomforts explained, with guidance on when a symptom needs professional assessment.',
        slug: 'managing-pregnancy-symptoms',
      },
    ],
  },
  {
    category: 'Nutrition in Pregnancy',
    image: '/images/Animated SVJ 3.jpg',
    imageAlt: 'Mother reading nutrition information',
    items: [
      {
        title: 'Eating Healthy During Pregnancy',
        source: 'Rwanda Ministry of Health',
        description: 'Nutrition guidance aligned with Rwanda Ministry of Health recommendations — iron, folate, protein, and foods to avoid.',
        slug: 'eating-healthy-during-pregnancy',
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
        description: 'What to expect during labour, when to go to the health facility, what to bring, and how to plan your support.',
        slug: 'preparing-for-labor-and-childbirth',
      },
    ],
  },
  {
    category: 'Postnatal Care',
    image: '/images/Animated SVJ 1.jpg',
    imageAlt: 'Mother after giving birth',
    items: [
      {
        title: 'Recovery After Childbirth',
        source: 'Rwanda Ministry of Health',
        description: 'What is normal after birth, breastfeeding support, emotional wellbeing, and your postnatal check-up schedule.',
        slug: 'recovery-after-childbirth',
      },
      {
        title: "Supporting Baby's Healthy Growth",
        source: 'Rwanda Biomedical Centre (RBC)',
        description: "Newborn care basics, growth monitoring, the Rwanda immunisation schedule, and developmental milestones.",
        slug: 'supporting-babys-healthy-growth',
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
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: p } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
        setProfile(p)
      } catch {}
    }
    load()
  }, [])

  const isLoggedIn = !!profile
  const dashHref = profile?.role === 'chw' ? '/dashboard/chw' : '/dashboard'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {isLoggedIn
        ? <DashboardHeader name={profile.full_name} />
        : <Navbar />
      }

      <section className="bg-[#FFF0F6] px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-navy mb-1">Health Resources</h1>
          <p className="text-sm font-medium text-navy/60">
            Evidence-based information from Rwanda Ministry of Health and Rwanda Biomedical Centre.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-10 py-10">
        {isLoggedIn && (
          <Link href={dashHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-8 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Dashboard
          </Link>
        )}

        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[8px]">
          <p className="text-sm font-medium text-amber-800">
            All articles are based on Rwanda Ministry of Health and Rwanda Biomedical Centre guidelines. Always consult your doctor or Community Health Worker for personal medical advice.
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
                  <Link key={item.title} href={`/resources/${item.slug}`}
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
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </Link>
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
