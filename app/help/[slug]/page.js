'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const HELP_CONTENT = {
  'getting-started': {
    title: 'Getting Started',
    articles: [
      {
        q: 'How to create an account',
        a: 'Go to the Ndarinzwe website and click "Get Started". Fill in your full name, email address, phone number, and choose your role — pregnant or new mother, or Community Health Worker. Enter your location (district and sector), then click "Create Account". Check your email for a verification link to activate your account.',
      },
      {
        q: 'Setting up your pregnancy profile',
        a: 'After logging in, go to your Profile page (your name in the top navigation). You can enter your Last Menstrual Period (LMP) date and due date so the app can calculate your pregnancy week. You can also add your health facility, district, and sector. This information helps your CHW provide the right care at the right time.',
      },
      {
        q: 'Understanding your dashboard',
        a: "Your dashboard is your main hub. It shows today's health check-in, upcoming reminders, any scheduled CHW visits, and a summary of your pregnancy progress. Quick links take you to all features: messages, reminders, health log, resources, and finding a CHW. Everything you need is one tap away.",
      },
      {
        q: 'Linking to a Community Health Worker',
        a: 'From your dashboard, click "Find a CHW". You can search by your district and sector, enter a CHW code if you have one, or use your GPS location to find CHWs near you. Once you find your CHW, click "Link to this CHW". They can then see your profile and send you messages and reminders.',
      },
      {
        q: 'How to enter your LMP date',
        a: 'Your Last Menstrual Period (LMP) date is the first day of your last period before becoming pregnant. You enter this during signup under "Pregnancy Details". To update it later, go to Settings from your dashboard menu. Ndarinzwe uses your LMP to calculate your current pregnancy week and estimated due date.',
      },
      {
        q: 'Changing your language settings',
        a: 'Ndarinzwe supports English and Kinyarwanda. To change your language, use the language toggle in the top navigation bar. Your choice is saved across the whole app. If you need help in Kinyarwanda, our support team can also respond in Kinyarwanda.',
      },
      {
        q: 'Getting your first ANC reminder',
        a: 'Go to the Reminders section from your dashboard. Click "+ Add Reminder", choose "ANC Visit" as the type, give it a clear title (e.g. "First ANC Visit at Kacyiru Health Centre"), set the date and time, and save. It will appear on your dashboard. Your linked CHW can also set ANC reminders for you.',
      },
    ],
  },
  'my-account': {
    title: 'My Account',
    articles: [
      {
        q: 'How to update your profile',
        a: 'Click your name in the top navigation to go to your Profile page. You can view your personal details, pregnancy information, and linked CHW. To edit your information, click "Edit Information" which takes you to the Settings page where you can update your name, phone number, district, and sector.',
      },
      {
        q: 'Changing your password',
        a: "From the Settings page, scroll to the Password section and click \"Change Password\". You'll need to enter your current password and then your new password twice to confirm. If you have forgotten your current password, log out and use \"Forgot Password\" on the login page to receive a reset link by email.",
      },
      {
        q: 'Managing privacy settings',
        a: "Your health data is protected under Rwanda's Law No. 058/2021 on personal data protection. When you link to a CHW, they can see your name, location, and due date to provide care. Your detailed health logs and personal messages remain private. Visit the Privacy page from the footer to understand your full rights.",
      },
      {
        q: 'Deleting your account',
        a: 'To request account deletion, email our support team at info@ndarinzwe.com with the subject "Account Deletion Request". Include your registered email address or phone number. Account deletion permanently removes all your data from Ndarinzwe and cannot be undone.',
      },
      {
        q: 'Resetting your login details',
        a: "If you cannot log in, click \"Forgot password?\" on the login page. Enter the email address you registered with. You will receive a password reset link by email — click it within 24 hours to set a new password. If the email doesn't arrive, check your spam folder or contact support.",
      },
      {
        q: 'Verifying your email address',
        a: 'After creating your account, Ndarinzwe sends a verification email to your registered address. Open that email and click the "Verify Email" link. If you did not receive it, check your spam folder. Contact support at info@ndarinzwe.com if you still cannot verify your email.',
      },
    ],
  },
  'reminders': {
    title: 'Reminders',
    articles: [
      {
        q: 'How reminders work',
        a: "Reminders are alerts you set for important pregnancy events — ANC visits, medications, postnatal check-ups, or anything else you need to remember. They appear on your dashboard under \"Upcoming Reminders\" sorted by date and time. Mark them done when completed. Your CHW can also set reminders for you from their side.",
      },
      {
        q: 'Setting a custom reminder',
        a: 'Go to the Reminders section from your dashboard. Click "+ Add Reminder". Choose a type (ANC Visit, Medication, Postnatal, or General), give it a clear title, set the date and time, and optionally add a note with extra details. Click "Save Reminder" — it will appear in your upcoming list immediately.',
      },
      {
        q: 'ANC Visit reminders',
        a: 'Rwanda Ministry of Health recommends at least 4 ANC visits: before 12 weeks, around 20 weeks, around 28 weeks, and at 36 weeks. Set a reminder for each visit using the "ANC Visit" type. Include your health facility name in the title so you remember where to go. Your CHW can also add these for you.',
      },
      {
        q: 'Medication reminders',
        a: 'Select "Medication" as the reminder type. Include the medication name in the title — for example, "Take iron and folic acid tablet". Set the time you need to take it each day. Your CHW or health facility can tell you the correct schedule and dosage for all pregnancy medications.',
      },
      {
        q: 'Turning off a reminder',
        a: 'To mark a reminder as completed, click "Mark done" next to it in your reminders list. It will move to the Completed section but stay visible as a record. To permanently remove a reminder, click "Delete". Completed reminders no longer appear in your upcoming list.',
      },
      {
        q: 'Why am I not receiving reminders?',
        a: 'Ndarinzwe shows reminders on your dashboard when you log in. Make sure you log in regularly to check your upcoming list. If your CHW set a reminder for you, it will also appear there. Push notifications and SMS alerts are being developed and will be available in a future update.',
      },
      {
        q: 'Reminder notification settings',
        a: 'Currently, reminders appear as cards on your dashboard sorted by date. You can see all upcoming and completed reminders from the Reminders section. We are actively working on mobile push notifications and SMS alerts so you are reminded even when you are not in the app.',
      },
    ],
  },
  'our-support': {
    title: 'Our Support',
    articles: [
      {
        q: 'How to contact support',
        a: 'Email us at info@ndarinzwe.com or call +250 712 345 678 (Monday–Friday, 8am–5pm CAT). For urgent pregnancy health matters, contact your CHW directly through the Messages section on your dashboard, or call SAMU on 912 in an emergency.',
      },
      {
        q: 'Speaking with your CHW',
        a: 'Once you are linked to a Community Health Worker, go to the Messages section on your dashboard to send them a message. Your CHW receives your message and can reply, set reminders, and schedule home visits for you. If you are not yet linked to a CHW, go to "Find a CHW" first.',
      },
      {
        q: 'Reporting a problem',
        a: 'If you experience a technical problem, email info@ndarinzwe.com with a description of what happened. Tell us which page you were on, what you were trying to do, and include your phone number or email. Screenshots are very helpful. We aim to respond within one business day.',
      },
      {
        q: 'Emergency contacts in Rwanda',
        a: 'In a pregnancy emergency: SAMU (medical emergency) — 912. Police — 112. National Women\'s Helpline — 3029. Your nearest district hospital can provide emergency obstetric care. Always call 912 first for serious danger signs. Tell your CHW through the Messages section as soon as you are safe.',
      },
      {
        q: 'What to do in a health emergency',
        a: 'Call SAMU on 912 immediately for any serious pregnancy danger sign: heavy bleeding, severe headache, fits or seizures, difficulty breathing, blurred vision, or reduced baby movement. Tell a family member or neighbour. Go to your nearest health facility without delay. Message your CHW through the app when it is safe to do so.',
      },
      {
        q: 'Accessibility support',
        a: 'Ndarinzwe is designed to work on all smartphones and is fully mobile-friendly. The app is available in English and Kinyarwanda so more mothers can use it comfortably. If you have difficulty using the app, your CHW can help you navigate it. Contact us at info@ndarinzwe.com for any other accessibility needs.',
      },
      {
        q: 'Language assistance',
        a: 'Ndarinzwe is available in English and Kinyarwanda. Use the language toggle at the top of the screen to switch. Our support team can respond in both languages — feel free to write to us in Kinyarwanda. We are working to ensure the platform is fully accessible to every mother in Rwanda.',
      },
    ],
  },
  'our-reviews': {
    title: 'Our Reviews',
    articles: [
      {
        q: 'What mothers say about Ndarinzwe',
        a: 'Mothers across Rwanda share that Ndarinzwe helps them feel more prepared and supported during pregnancy. Many value having their CHW accessible through the app and being able to track their ANC visits and reminders in one place. We are proud to support safer pregnancies every day.',
      },
      {
        q: 'CHW feedback and success stories',
        a: 'Community Health Workers who use Ndarinzwe report that it helps them manage their assigned mothers more effectively, track upcoming visits, and stay connected between home visits. The ability to set reminders and write care reports directly in the app has been particularly valued.',
      },
      {
        q: 'How we use your feedback',
        a: 'All feedback you share — by email, through the app, or via your CHW — is reviewed by the Ndarinzwe team. We use it to fix problems, improve existing features, and decide what to build next. Your identity is kept private. Anonymised feedback may be shared with partner organisations to improve maternal health programmes.',
      },
      {
        q: 'Rating your experience',
        a: 'We welcome your honest feedback. Email us at info@ndarinzwe.com to share what is working well and what could be better. In a future update, we will add an in-app rating feature so you can rate specific features and leave comments directly from your dashboard.',
      },
      {
        q: 'Submitting a review',
        a: 'To share your experience with Ndarinzwe, email info@ndarinzwe.com or ask your CHW to pass your feedback to the team. We are developing a community feedback feature that will let mothers submit reviews directly from the app. Your voice shapes how Ndarinzwe grows.',
      },
      {
        q: 'Community testimonials',
        a: 'Ndarinzwe is built with input from real mothers and CHWs across Rwanda. If you would like to share your story to inspire other mothers, contact us at info@ndarinzwe.com. With your permission, we may share your experience anonymously on the platform to encourage others.',
      },
      {
        q: 'Partner organisation feedback',
        a: 'Ndarinzwe works alongside the Rwanda Ministry of Health, Rwanda Biomedical Centre, and district health programmes. Feedback from these partners ensures the app aligns with national maternal health guidelines. If you represent a partner organisation, contact us at info@ndarinzwe.com.',
      },
      {
        q: 'Impact report highlights',
        a: "Ndarinzwe tracks key maternal health indicators aligned with Rwanda's national targets, including ANC visit rates, CHW coverage, and postnatal care uptake. We publish impact updates to share our progress. To receive updates, contact us at info@ndarinzwe.com.",
      },
    ],
  },
  'ndarinzwe': {
    title: 'Ndarinzwe',
    articles: [
      {
        q: 'What is Ndarinzwe Health?',
        a: 'Ndarinzwe — meaning "let me be cared for" in Kinyarwanda — is a digital maternal health platform built for Rwanda. It connects pregnant women and new mothers with their Community Health Workers (Inshuti Mu Buzima) and provides trusted, Rwanda-specific health information sourced from the Ministry of Health and Rwanda Biomedical Centre.',
      },
      {
        q: 'Our mission and values',
        a: 'Our mission is to make safe motherhood accessible to every woman in Rwanda, regardless of where she lives. We believe in privacy-first design, culturally appropriate care, and technology that serves mothers — not advertisers. All health content on Ndarinzwe is sourced from official Rwanda Ministry of Health and RBC guidelines.',
      },
      {
        q: 'How we protect your data',
        a: "Your personal health information is encrypted and stored securely. Ndarinzwe is built in compliance with Rwanda's Law No. 058/2021 on personal data protection. We do not sell your data or share it with third parties without your consent. Only your linked CHW and healthcare providers can access the information you choose to share.",
      },
      {
        q: 'Working with the Ministry of Health',
        a: 'Ndarinzwe aligns all health content and care pathways with Rwanda Ministry of Health guidelines for antenatal, intrapartum, and postnatal care. Our CHW tools are designed to complement the Inshuti Mu Buzima programme and support Community Health Workers in their existing roles.',
      },
      {
        q: 'Partnerships and affiliations',
        a: 'Ndarinzwe collaborates with the Rwanda Ministry of Health, Rwanda Biomedical Centre (RBC), and district-level health programmes. We are committed to supporting Rwanda\'s national goals for maternal and child health. For partnership enquiries, contact us at info@ndarinzwe.com.',
      },
    ],
  },
}

export default function HelpCategoryPage() {
  const { slug } = useParams()
  const [openIdx, setOpenIdx] = useState(null)
  const [query, setQuery] = useState('')

  const section = HELP_CONTENT[slug]

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-24">
            <p className="text-lg font-bold text-navy mb-4">Article not found</p>
            <Link href="/help" className="text-sm font-medium text-pink-primary underline underline-offset-2">
              Back to Help Centre
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const shown = query.trim()
    ? section.articles.filter(a =>
        a.q.toLowerCase().includes(query.toLowerCase()) ||
        a.a.toLowerCase().includes(query.toLowerCase())
      )
    : section.articles

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <section className="bg-[#FFF0F6] px-6 md:px-10 py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-5 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Help Centre
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-5">{section.title}</h1>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search in ${section.title}…`}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-[8px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-10">
        {shown.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-gray-400 mb-3">No results for &ldquo;{query}&rdquo;</p>
            <button onClick={() => setQuery('')} className="text-sm font-bold text-navy underline underline-offset-2">
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((article, i) => (
              <div key={i} className="border border-gray-200 rounded-[10px] overflow-hidden">
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-bold text-navy">{article.q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    className={`shrink-0 text-navy/40 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-600 leading-relaxed pt-4">{article.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 p-6 bg-[#FFF0F6] rounded-[12px] text-center">
          <p className="text-sm font-bold text-navy mb-1">Still need help?</p>
          <p className="text-sm font-medium text-navy/60 mb-4">
            Our support team is here Monday to Friday, 8am–5pm CAT.
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity"
          >
            Contact Support
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
