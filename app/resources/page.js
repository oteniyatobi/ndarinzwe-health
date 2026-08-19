'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/Footer'

const RESOURCES = [
  {
    category: '🤰 My Pregnancy Journey',
    image: '/images/Pregnant mother 1.avif',
    imageAlt: 'Pregnant mother on her journey',
    items: [
      { title: "You're Pregnant: What Should You Do First?", source: 'Rwanda Ministry of Health / WHO', description: 'The most important first steps after confirming a pregnancy — from starting ANC to folic acid and lifestyle changes.', slug: 'youre-pregnant-what-to-do-first' },
      { title: 'Your Pregnancy Journey: Week by Week', source: 'Rwanda Ministry of Health / WHO', description: 'How your pregnancy and baby progress through all three trimesters — from week 1 to week 40.', slug: 'your-pregnancy-journey-week-by-week' },
      { title: 'What Is Happening to Your Baby This Week?', source: 'Rwanda Ministry of Health / WHO', description: "Stage-by-stage guide to your baby's development from embryo to full-term newborn.", slug: 'what-is-happening-to-your-baby-this-week' },
      { title: 'What Changes Should You Expect in Your Body?', source: 'Rwanda Ministry of Health / WHO', description: 'A trimester-by-trimester guide to normal body changes and clear warning signs needing hospital attention.', slug: 'changes-in-your-body-during-pregnancy' },
      { title: 'Your First ANC Visit: What to Expect', source: 'Rwanda Ministry of Health', description: 'Exactly what happens at your first antenatal care appointment — tests, treatments, and your ANC card.', slug: 'your-first-anc-visit-what-to-expect' },
      { title: 'Why Starting ANC Early Matters', source: 'Rwanda Ministry of Health / WHO 2016', description: 'The evidence for beginning antenatal care before 12 weeks and why early registration saves lives.', slug: 'why-starting-anc-early-matters' },
      { title: 'Your ANC Journey: What Happens at Each Visit?', source: 'Rwanda Ministry of Health', description: 'A detailed guide to each ANC contact — what is checked, what is given, and why each visit matters.', slug: 'your-anc-journey-what-happens-at-each-visit' },
      { title: 'Important Tests During Pregnancy', source: 'Rwanda Ministry of Health / WHO', description: 'Understanding blood pressure, haemoglobin, HIV, syphilis, urine, and malaria prevention at ANC.', slug: 'important-tests-during-pregnancy' },
      { title: 'Your Pregnancy Checklist for This Month', source: 'Rwanda Ministry of Health', description: 'A month-by-month checklist covering ANC, supplements, nutrition, warning signs, and birth preparation.', slug: 'your-pregnancy-checklist-for-this-month' },
      { title: 'Questions to Ask at Your Next ANC Visit', source: 'Rwanda Ministry of Health / WHO', description: 'The most important questions to ask your health provider at each stage of pregnancy.', slug: 'questions-to-ask-at-your-anc-visit' },
      { title: "What Your CHW Can Help You With During Pregnancy", source: "Rwanda Ministry of Health", description: "The role of your Community Health Worker (Abajyanama b'ubuzima) — what they can and cannot do.", slug: 'what-your-chw-can-help-with-during-pregnancy' },
      { title: 'When Should You Contact Your Health Facility?', source: 'Rwanda Ministry of Health', description: 'Clear guidance on which symptoms require immediate hospital attendance and which can wait.', slug: 'when-should-you-contact-your-health-facility' },
    ],
  },
  {
    category: '🩺 Antenatal Care',
    image: '/images/istockphoto-182505788-612x612.webp',
    imageAlt: 'Mother at an antenatal care visit',
    items: [
      { title: 'ANC: More Than Just a Clinic Visit', source: 'Rwanda Ministry of Health / WHO 2016', description: 'What antenatal care actually delivers — and why every contact matters beyond routine measurements.', slug: 'anc-more-than-just-a-clinic-visit' },
      { title: 'When Should I Start ANC?', source: 'Rwanda Ministry of Health / WHO', description: 'Why beginning ANC before 12 weeks is critical and what to do if you started late.', slug: 'when-should-i-start-anc' },
      { title: 'How Many ANC Contacts Should I Have?', source: 'Rwanda Ministry of Health / WHO 2016', description: "Rwanda's ANC schedule — what happens at each of the four essential contacts and why none should be missed.", slug: 'how-many-anc-contacts-should-i-have' },
      { title: 'What Happens During an ANC Visit?', source: 'Rwanda Ministry of Health', description: 'A step-by-step walkthrough of every procedure and check at a typical ANC appointment.', slug: 'what-happens-during-an-anc-visit' },
      { title: 'Why Your Blood Pressure Is Checked at Every Visit', source: 'Rwanda Ministry of Health / WHO', description: 'What blood pressure monitoring detects, what readings mean, and when high readings are an emergency.', slug: 'why-your-blood-pressure-is-checked' },
      { title: 'Why Your Urine Is Tested at Every ANC Visit', source: 'Rwanda Ministry of Health / WHO', description: 'What urine testing screens for — preeclampsia, gestational diabetes, and urinary tract infections.', slug: 'why-your-urine-is-tested' },
      { title: 'Understanding Blood Tests During Pregnancy', source: 'Rwanda Ministry of Health / WHO', description: 'A guide to haemoglobin, blood type, HIV, syphilis, and glucose tests — and what each result means.', slug: 'understanding-blood-tests-during-pregnancy' },
      { title: 'Why HIV Testing Matters During Pregnancy', source: "Rwanda MoH / PMTCT Programme", description: "Rwanda's PMTCT programme and what an HIV-positive result means for your care and your baby.", slug: 'why-hiv-testing-matters-during-pregnancy' },
      { title: 'Why Syphilis Testing Matters During Pregnancy', source: 'Rwanda Ministry of Health / WHO', description: 'Congenital syphilis is almost entirely preventable with one test and one injection — here is why it matters.', slug: 'why-syphilis-testing-matters' },
      { title: 'Ultrasound During Pregnancy', source: 'Rwanda Ministry of Health / WHO', description: 'When ultrasounds are done, what they show, and what to expect during a pregnancy scan.', slug: 'ultrasound-during-pregnancy' },
      { title: 'Iron and Folic Acid During Pregnancy', source: 'Rwanda Ministry of Health / WHO', description: 'Why iron and folic acid are essential, how to take them correctly, and managing side effects.', slug: 'iron-and-folic-acid-during-pregnancy' },
      { title: 'Why Keeping Your ANC Appointments Matters', source: 'Rwanda DHS 2019–20 / WHO', description: 'The evidence that more ANC contacts mean better outcomes — and how to overcome barriers to attendance.', slug: 'why-keeping-your-anc-appointments-matters' },
      { title: 'What Happens If I Miss an ANC Appointment?', source: 'Rwanda Ministry of Health', description: 'What to do if you have missed a visit, how to get back on track, and when to seek care immediately.', slug: 'what-happens-if-i-miss-an-anc-appointment' },
      { title: 'How Ndarinzwe Helps You Stay on Track', source: 'Ndarinzwe Health', description: 'How the Ndarinzwe platform supports your antenatal care journey from registration to delivery.', slug: 'how-ndarinzwe-helps-you-stay-on-track' },
    ],
  },
  {
    category: 'Warning Signs & Safety',
    image: '/images/Animated SVJ 2.jpg',
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
