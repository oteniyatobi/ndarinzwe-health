'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const FAQS = [
  {
    q: 'What is Ndarinzwe?',
    a: 'Ndarinzwe means "I am cared for" in Kinyarwanda. Ndarinzwe Health is a digital maternal health platform built for pregnant women, new mothers, and Community Health Workers (Abajyanama b\'ubuzima) across Rwanda. It brings together verified health information, pregnancy tracking, antenatal care reminders, and personalised care updates — all in one place, available in Kinyarwanda and English.',
  },
  {
    q: 'How can Ndarinzwe support me during pregnancy?',
    a: 'Ndarinzwe provides week-by-week pregnancy information, reminders for your antenatal care (ANC) visits, a danger-signs checklist, and nutrition guidance. Your Community Health Worker (Umujyanama w\'ubuzima) can monitor your progress and send you care messages through the platform. All health content is aligned with Rwanda Ministry of Health and Rwanda Biomedical Centre (RBC) guidelines.',
  },
  {
    q: 'When should I start using Ndarinzwe?',
    a: "You can register at any stage of pregnancy. Starting in your first trimester gives you access to the full ANC reminder schedule from the beginning. Rwanda's national antenatal care guidelines recommend at least four ANC visits during pregnancy — Ndarinzwe helps you prepare for and track each one.",
  },
  {
    q: 'What do I do in an emergency during pregnancy?',
    a: 'In any obstetric emergency — heavy bleeding, severe headache, fits, baby not moving, or any sudden severe symptom — go to your nearest health facility or hospital immediately. Do not wait. Call for emergency transport if needed. Your Community Health Worker (Umujyanama w\'ubuzima) can support your routine care between visits, but emergencies must always be handled by doctors and nurses at a health facility. When in doubt, go directly to hospital.',
  },
  {
    q: 'Can I send messages to my CHW through Ndarinzwe?',
    a: 'Messaging on Ndarinzwe is designed so that your Community Health Worker (Umujyanama w\'ubuzima) reaches out to you — based on your health updates, upcoming appointments, and their observations from your care visits. You will receive messages and care reminders from your CHW through the app. For emergencies, always contact or go directly to your nearest hospital or health facility.',
  },
  {
    q: 'Is my health information safe with Ndarinzwe?',
    a: "Yes. All personal health data is stored securely using encryption and is only accessible to you and the care providers you choose to share it with. Ndarinzwe is designed in compliance with Rwanda's Law No. 058/2021 of 13/10/2021 relating to the protection of personal data and privacy. We never sell or share your information with third parties without your explicit consent.",
  },
  {
    q: 'Can I use Ndarinzwe without visiting a healthcare facility?',
    a: 'Ndarinzwe is designed to complement — not replace — in-person care. It helps you stay informed and track your health between appointments. Rwanda Ministry of Health recommends all pregnant women attend their antenatal care visits at an approved health facility. Ndarinzwe helps you prepare for those visits — it does not substitute for professional medical advice or clinical examination.',
  },
  {
    q: 'How do I connect with a Community Health Worker?',
    a: "During sign-up, you can link your account to your CHW (Abajyanama b'ubuzima) by entering their unique code or searching by your village or sector. Once linked, your CHW can follow your progress and send you care reminders. If you don't know your CHW, your nearest health centre can help you identify them.",
  },
  {
    q: 'Can I still use Ndarinzwe after giving birth?',
    a: "Yes. After delivery, the app switches to postpartum mode — focused on your baby's growth, immunisation schedule, breastfeeding support, and postnatal recovery. You can continue tracking your wellbeing and your baby's milestones, and your CHW will continue to follow up with you through the platform.",
  },
  {
    q: 'Is Ndarinzwe free to use?',
    a: "Yes. Ndarinzwe is free to download and use for both mothers and Community Health Workers. There are no subscription fees. Standard data charges from your mobile network provider may apply when using the platform.",
  },
  {
    q: 'What languages is Ndarinzwe available in?',
    a: 'Ndarinzwe is available in both Kinyarwanda and English. You can set your preferred language in your account settings and switch between them at any time.',
  },
  {
    q: "Can Community Health Workers (Abajyanama b'ubuzima) also use Ndarinzwe?",
    a: "Yes. Ndarinzwe has a dedicated CHW interface that allows Abajyanama b'ubuzima to manage their assigned mothers, track pregnancy progress, send care reminders, and receive alerts. CHWs register using a separate CHW account type and must be formally registered in Rwanda's national CHW programme.",
  },
  {
    q: 'What should I do if I cannot access the platform?',
    a: 'If you are unable to log in or the platform is not working, try restarting the app or checking your internet connection. If the problem continues, contact our support team by email at info@ndarinzwe.com or call +250 712 345 678 (Monday to Friday, 8am–5pm CAT).',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null)
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-pink-primary/10 px-6 md:px-16 py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold text-pink-primary mb-3 uppercase tracking-wide">Support</p>
          <h1 className="text-3xl md:text-4xl font-bold text-navy leading-snug mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm font-medium text-black/70 leading-relaxed">
            Can't find the answer you're looking for? Reach our support team at{' '}
            <a href="mailto:info@ndarinzwe.com" className="font-bold text-navy hover:underline">
              info@ndarinzwe.com
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ accordion */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-14">
        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {FAQS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-bold text-navy">{item.q}</span>
                <svg
                  className={`flex-shrink-0 w-4 h-4 text-navy transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                  viewBox="0 0 16 10"
                  fill="none"
                >
                  <path
                    d="M1 1l7 7 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {openIndex === i && (
                <p className="pb-5 text-sm font-medium text-black leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Emergency notice */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-[10px] px-6 py-5">
          <p className="text-sm font-bold text-red-700 mb-1">In a medical emergency</p>
          <p className="text-sm font-medium text-red-700">
            Always go to your nearest hospital or health facility immediately. Do not wait for your CHW — they are not equipped to handle obstetric emergencies. Call for transport and go directly to hospital.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="mt-10 bg-pink-primary/10 rounded-[10px] px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-navy mb-2">Still have questions?</h2>
            <p className="text-sm font-medium text-black/70">
              Our support team is available Monday to Friday, 8am – 5pm (CAT).
            </p>
          </div>
          <Link
            href="/contact"
            className="flex-shrink-0 px-7 py-3 bg-navy text-white text-sm font-medium rounded-[5px] hover:opacity-90 transition-opacity"
          >
            Contact Us
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
