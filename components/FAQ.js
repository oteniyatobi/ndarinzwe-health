'use client'

import { useState } from 'react'

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
    a: 'Yes. All personal health data is stored securely using encryption and is only accessible to you and the care providers you choose to share it with. Ndarinzwe is designed in compliance with Rwanda\'s Law No. 058/2021 of 13/10/2021 relating to the protection of personal data and privacy. We never sell or share your information with third parties without your explicit consent.',
  },
  {
    q: 'Can I use Ndarinzwe without visiting a healthcare facility?',
    a: 'Ndarinzwe is designed to complement — not replace — in-person care. It helps you stay informed, track your health between appointments, and stay connected with your CHW. Rwanda Ministry of Health recommends all pregnant women attend their antenatal care visits at an approved health facility. Ndarinzwe helps you prepare for and remember those visits — it does not substitute for professional medical advice or examination.',
  },
  {
    q: 'How do I connect with a Community Health Worker?',
    a: 'During sign-up, you can link your account to your CHW (Inshuti Mu Buzima) by entering their unique code or searching by your village or sector. Once linked, your CHW can follow your progress, send you care reminders, and check in between your scheduled facility visits. If you do not know your CHW, your nearest health centre can help you identify them.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
          Frequently Asked Questions
        </h2>

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
      </div>
    </section>
  )
}
