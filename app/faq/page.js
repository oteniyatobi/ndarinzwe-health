'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const FAQS = [
  {
    q: 'What is Ndarinzwe?',
    a: 'Ndarinzwe means "let me be cared for" in Kinyarwanda. Ndarinzwe Health is a digital maternal health platform built for pregnant women, new mothers, and Community Health Workers (Inshuti Mu Buzima) across Rwanda. It brings together verified health information, pregnancy tracking, antenatal care reminders, and a direct line to your CHW — all in one place, available in Kinyarwanda and English.',
  },
  {
    q: 'How can Ndarinzwe support me during pregnancy?',
    a: 'Ndarinzwe provides week-by-week pregnancy information, reminders for your antenatal care (ANC) visits, a danger-signs checklist to monitor at home, and nutrition guidance. You can also send messages to your Community Health Worker through the platform and track key milestones across all three trimesters and into postpartum. All health content is aligned with Rwanda Ministry of Health and Rwanda Biomedical Centre (RBC) guidelines.',
  },
  {
    q: 'When should I start using Ndarinzwe?',
    a: "You can register at any stage of pregnancy. Starting in your first trimester gives you access to the full ANC reminder schedule from the beginning. Rwanda's national antenatal care guidelines recommend at least four ANC visits during pregnancy — Ndarinzwe helps you prepare for and remember each one.",
  },
  {
    q: 'Is my health information safe with Ndarinzwe?',
    a: "Yes. All personal health data is stored securely using encryption and is only accessible to you and the care providers you choose to share it with. Ndarinzwe is designed in compliance with Rwanda's Law No. 058/2021 of 13/10/2021 relating to the protection of personal data and privacy. We never sell or share your information with third parties without your explicit consent.",
  },
  {
    q: 'Can I use Ndarinzwe without visiting a healthcare facility?',
    a: 'Ndarinzwe is designed to complement — not replace — in-person care. It helps you stay informed, track your health between appointments, and stay connected with your CHW. Rwanda Ministry of Health recommends all pregnant women attend their antenatal care visits at an approved health facility. Ndarinzwe helps you prepare for and remember those visits — it does not substitute for professional medical advice or examination.',
  },
  {
    q: 'How do I connect with a Community Health Worker?',
    a: 'During sign-up, you can link your account to your CHW (Inshuti Mu Buzima) by entering their unique code or searching by your village or sector. Once linked, your CHW can follow your progress, send you care reminders, and check in between your scheduled facility visits. If you do not know your CHW, your nearest health centre can help you identify them.',
  },
  {
    q: 'Is Ndarinzwe free to use?',
    a: 'Yes. Ndarinzwe is free to download and use for both mothers and Community Health Workers. There are no subscription fees. Standard data charges from your mobile network provider may apply when using the platform.',
  },
  {
    q: 'What languages is Ndarinzwe available in?',
    a: 'Ndarinzwe is available in both Kinyarwanda and English. You can set your preferred language in your account settings and switch between them at any time.',
  },
  {
    q: 'What should I do if I cannot access the platform?',
    a: 'If you are unable to log in or the platform is not working, try restarting the app or checking your internet connection. If the problem continues, contact our support team by email at info@ndarinzwe.com or call +250 712 345 678 (Monday to Friday, 8am–5pm CAT).',
  },
  {
    q: 'Can Community Health Workers (CHWs) also use Ndarinzwe?',
    a: 'Yes. Ndarinzwe has a dedicated CHW interface that allows Inshuti Mu Buzima to manage their assigned mothers, track pregnancy progress, send care reminders, and receive alerts. CHWs register using a separate CHW account type and must be formally registered in Rwanda\'s national CHW programme.',
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

        {/* Contact CTA */}
        <div className="mt-14 bg-pink-primary/10 rounded-[10px] px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
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
