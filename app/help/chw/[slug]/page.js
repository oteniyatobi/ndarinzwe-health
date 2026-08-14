'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import HelpNavbar from '@/components/HelpNavbar'
import Footer from '@/components/Footer'

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Resources', href: '/resources' },
]

const HELP_CONTENT = {
  'getting-started': {
    title: 'Getting Started',
    articles: [
      {
        q: 'How to register as a CHW',
        a: 'Go to the Ndarinzwe website and click "Get Started". Choose "Community Health Worker (Inshuti Mu Buzima)" as your role. Fill in your full name, phone number, email, and your district and sector. Enter your health facility and years of experience. Click "Create Account" and verify your email. Your CHW account will be reviewed and you will receive your CHW code by email.',
      },
      {
        q: 'Getting your CHW code',
        a: "Your CHW code is a unique identifier that mothers use to link to you on Ndarinzwe. Once your account is approved, your code appears on your CHW dashboard and in your Profile page. Share this code with mothers in your community so they can find and link to you directly. If you haven't received your code, contact support at info@ndarinzwechw.com.",
      },
      {
        q: 'Setting up your CHW profile',
        a: 'After logging in, go to your Profile page. Complete all fields: your full name, phone number, health facility, district, sector, and years of experience as a CHW. A complete profile helps mothers in your community find you and confirms your credentials. You can update your profile at any time from the Settings page.',
      },
      {
        q: 'Understanding the CHW dashboard',
        a: "Your CHW dashboard is the central place for managing your mothers. It shows: the total number of mothers linked to you, upcoming home visit reminders, recent messages from mothers, a list of your assigned mothers with their due dates, and quick links to all features. Check your dashboard daily to stay on top of each mother's care.",
      },
      {
        q: 'Finding and linking to mothers',
        a: "Mothers link to you using your CHW code or by searching your name and location. Once a mother links to you, they appear in your \"My Mothers\" list on the dashboard. You can then view their profile (name, due date, ANC visit history), send them messages, and set reminders for their visits. You cannot link to a mother yourself — mothers must initiate the link.",
      },
      {
        q: 'How to use the app in low-connectivity areas',
        a: 'Ndarinzwe is a web app that works on any smartphone browser. For areas with limited internet, we recommend logging in when you have connectivity to check messages and update records. We are developing offline features for future updates. In the meantime, use the app when you have a signal and save key information (like a mother\'s due date) in your notes.',
      },
      {
        q: 'CHW training resources on the app',
        a: 'The Resources section of Ndarinzwe includes health content sourced from the Rwanda Ministry of Health and Rwanda Biomedical Centre. This covers antenatal care, nutrition, labour, postnatal care, and mental health. These are the same guidelines you use in your work and can be shared with mothers you are supporting.',
      },
    ],
  },
  'my-account': {
    title: 'My Account',
    articles: [
      {
        q: 'Updating your CHW profile',
        a: 'Go to your Profile page (your name in the top navigation) and click "Edit Information". Update your name, phone number, district, sector, health facility, or years of experience. Make sure your health facility is accurate — mothers in your area use this when searching for a CHW. Save changes when done.',
      },
      {
        q: 'Changing your password',
        a: "From the Settings page, scroll to the Password section and click \"Change Password\". Enter your current password and then your new password twice to confirm. If you've forgotten your current password, log out and use \"Forgot Password\" on the login page to receive a reset link by email.",
      },
      {
        q: 'What is my CHW code and where do I find it?',
        a: 'Your CHW code is a unique identifier assigned to your account. Mothers use it to link directly to you without searching. Find it on your CHW dashboard under your profile summary, or in your Profile page. Share it verbally or in writing with mothers in your community when they register on Ndarinzwe.',
      },
      {
        q: 'Updating your health facility information',
        a: "Your health facility information is listed on your CHW profile and is visible to mothers when they search for a CHW. To update it, go to Settings and edit the \"Health Facility\" field. Keep this current — if you are transferred to a new facility, update your profile immediately so mothers in your new area can find you.",
      },
      {
        q: 'Managing your assigned mothers list',
        a: 'Your assigned mothers appear in the "My Mothers" section of your dashboard. You can view each mother\'s profile, due date, ANC history, and send them messages. If a mother moves away or is no longer under your care, she can unlink from you from her own account. Contact support if you need to remove a mother manually.',
      },
      {
        q: 'Deleting your CHW account',
        a: 'To request account deletion, email info@ndarinzwechw.com with the subject "CHW Account Deletion Request". Include your registered email address and CHW code. Before deleting, make sure any mothers linked to you are transferred to another CHW to avoid disruption to their care. Account deletion is permanent.',
      },
    ],
  },
  'reminders': {
    title: 'Reminders',
    articles: [
      {
        q: 'How to set reminders for mothers',
        a: 'From your CHW dashboard, click on a mother\'s name in your "My Mothers" list to open her profile. Then click "+ Add Reminder". Choose the reminder type (ANC Visit, Medication, Postnatal, Home Visit, or General), add a clear title and set the date and time. Click "Save". The reminder will appear on both your dashboard and the mother\'s dashboard.',
      },
      {
        q: 'Types of reminders you can set',
        a: 'You can set the following reminder types for mothers you support: ANC Visit (for antenatal check-up dates), Medication (for iron, folic acid, or other pregnancy medications), Postnatal (for postnatal care visits), Home Visit (to remind yourself to conduct a home visit), and General (for any other care-related reminder). Each type is colour-coded on the dashboard.',
      },
      {
        q: 'Viewing all reminders across your mothers',
        a: 'Your CHW dashboard shows upcoming reminders across all your assigned mothers in chronological order. You can also go to the Reminders section to see a full list. Each reminder shows the mother\'s name, the reminder type, and the date and time. This gives you a clear view of all upcoming care events for your whole group.',
      },
      {
        q: 'Editing and deleting reminders you set',
        a: 'To edit a reminder, find it in the Reminders section and click "Edit". You can update the title, type, date, or time. To delete it, click "Delete". Mothers will see the updated or removed reminder on their dashboard. If a mother has already marked a reminder as done, you cannot edit it — only delete it.',
      },
      {
        q: 'How mothers see the reminders you set',
        a: 'Reminders you set for a mother appear directly on her dashboard in her "Upcoming Reminders" section — exactly alongside any reminders she has set herself. The mother cannot tell the difference in terms of how they look. She can mark them done or view them but cannot delete reminders set by you without contacting you first.',
      },
      {
        q: 'Best practices for reminder scheduling',
        a: 'Set ANC visit reminders at least 3–5 days before the appointment so mothers have time to prepare. For daily medication reminders, set the time for when the mother is most likely to see it (e.g. morning after breakfast). Set postnatal reminders within 24–48 hours of delivery. Always include the health facility name in the reminder title.',
      },
      {
        q: 'What happens if a mother dismisses a reminder',
        a: 'When a mother marks a reminder as "done" or dismisses it, it moves to her Completed section. It no longer appears in her upcoming list. On your CHW dashboard, completed reminders are shown with a tick so you know they were acknowledged. If an ANC reminder was dismissed but you are unsure if the mother attended, follow up through the Messages section.',
      },
    ],
  },
  'our-support': {
    title: 'Our Support',
    articles: [
      {
        q: 'How to contact CHW support',
        a: 'For CHW-specific support, email info@ndarinzwechw.com or call +250 776 543 210 (Monday–Friday, 8am–5pm CAT). For urgent pregnancy emergencies involving a mother in your care, call SAMU on 912 immediately. Do not wait for app support in a health emergency.',
      },
      {
        q: 'Technical help for CHWs',
        a: 'If you experience a technical problem with the CHW features — such as not being able to see a mother\'s profile, send messages, or set reminders — email info@ndarinzwechw.com. Describe what you were trying to do and what happened. Screenshots are very helpful. We aim to respond to CHW technical issues within one business day.',
      },
      {
        q: 'Escalating a mother\'s urgent health concern',
        a: "If a mother messages you about a danger sign — heavy bleeding, severe headache, reduced fetal movement, high fever, or fitting — do not wait. Call SAMU (912) on her behalf if possible. Contact the nearest health facility or district hospital. Use the Messages section to acknowledge her message and tell her what to do. Document the interaction in her care record.",
      },
      {
        q: 'Reporting a safeguarding concern',
        a: 'If you become aware of a safeguarding concern — domestic violence, child at risk, or a mother in danger — follow your standard Inshuti Mu Buzima safeguarding protocols. Contact your CHW supervisor or local health authority immediately. You can also email info@ndarinzwechw.com to alert the Ndarinzwe team. The National Women\'s Helpline is available on 3029.',
      },
      {
        q: 'Connecting with your CHW supervisor',
        a: 'Ndarinzwe does not currently connect you to your CHW supervisor directly through the app. Continue to use your district health office contacts for supervision and reporting. We are working on a supervisor-CHW feature for a future update. If your supervisor wants to access Ndarinzwe, they can contact us at info@ndarinzwechw.com.',
      },
      {
        q: 'Language support for CHWs',
        a: 'Ndarinzwe is available in English and Kinyarwanda. You can switch languages using the toggle at the top of the screen. Our CHW support team can communicate in both languages. Feel free to email or call us in Kinyarwanda — we will respond in the same language.',
      },
      {
        q: 'CHW programme resources',
        a: 'The Resources section on Ndarinzwe includes maternal health content from the Rwanda Ministry of Health and RBC. These are the same guidelines CHWs follow in their work. You can direct mothers to specific articles or read them yourself as a reference during home visits. All content is available in English and Kinyarwanda.',
      },
    ],
  },
  'our-reviews': {
    title: 'Our Reviews',
    articles: [
      {
        q: 'Sharing feedback on CHW tools',
        a: 'We actively want to hear what CHWs think of the Ndarinzwe tools. Email info@ndarinzwechw.com with your feedback — what is working well, what is difficult, and what features you need. CHW feedback has directly shaped features already in the app, and your input continues to guide development.',
      },
      {
        q: 'Reporting a bug or issue',
        a: 'If you find a bug or something that is not working correctly, email info@ndarinzwechw.com with the subject "Bug Report". Describe the problem, which page it was on, and what you expected to happen. Include screenshots if you can. We prioritise CHW-reported bugs and will confirm receipt within one business day.',
      },
      {
        q: 'How CHW feedback improves the app',
        a: 'Every CHW review and report is read by the Ndarinzwe product team. Feedback is categorised by theme (usability, missing features, bugs, content) and used to plan each update. We may follow up with CHWs who report specific issues to understand the problem more deeply. Changes made based on CHW feedback are noted in our release updates.',
      },
      {
        q: 'Participating in CHW surveys',
        a: 'From time to time, Ndarinzwe runs short surveys to gather structured feedback from CHWs. If you are invited to participate, you will receive an email from info@ndarinzwechw.com. Participation is voluntary but greatly valued. Survey responses help us understand how CHWs use the app in the field and what changes would have the most impact.',
      },
      {
        q: 'Success stories and case studies',
        a: 'If you have a success story — a mother you supported who had a safe delivery, or a reminder that prevented a missed ANC visit — we want to hear it. Email info@ndarinzwechw.com. With your permission, we may use anonymised stories in our impact reports or to train other CHWs on best practices. Your identity will never be shared without consent.',
      },
      {
        q: 'How your data is used in impact reports',
        a: 'Ndarinzwe tracks aggregated, anonymised data — such as how many reminders were set, how many ANC visits were completed, and how many mothers are linked to CHWs. This data is used to measure the platform\'s impact and shared with partner organisations like the Rwanda Ministry of Health. Individual CHW or mother data is never published.',
      },
      {
        q: 'Anonymised community feedback',
        a: 'When you share feedback with us, we remove identifying information before using it in any internal or external report. We may quote anonymised feedback in presentations or publications to demonstrate real CHW experiences. You will always be asked for explicit consent before any direct quote is used with attribution.',
      },
      {
        q: 'Partner programme feedback',
        a: 'Ndarinzwe partners with the Rwanda Ministry of Health, RBC, and district health programmes. If your district programme has specific feedback about how Ndarinzwe supports CHW operations, contact us at info@ndarinzwechw.com. We value institutional feedback and can arrange a call with your district health office to discuss.',
      },
    ],
  },
  'ndarinzwe': {
    title: 'Ndarinzwe',
    articles: [
      {
        q: 'What is Ndarinzwe for Community Health Workers?',
        a: 'Ndarinzwe is a digital maternal health platform that connects Community Health Workers (Inshuti Mu Buzima) with the mothers they support. It gives CHWs a structured way to track assigned mothers, set care reminders, send messages, and document visits — all from a smartphone. It is designed to complement, not replace, the CHW programme.',
      },
      {
        q: 'How Ndarinzwe supports Inshuti Mu Buzima',
        a: 'Ndarinzwe is built around the Inshuti Mu Buzima care model. CHWs can manage their full caseload digitally, set ANC and postnatal reminders aligned with Rwanda MoH guidelines, and stay in contact with mothers between home visits. The platform is designed to reduce missed care and strengthen the CHW-mother relationship through consistent digital follow-up.',
      },
      {
        q: 'CHW data privacy and data protection',
        a: "As a CHW, the information you access about mothers is provided to you for care purposes only. You are not permitted to share a mother's health information with third parties without her consent. Ndarinzwe is built in compliance with Rwanda's Law No. 058/2021 on personal data protection. CHW accounts are individual — do not share your login details with others.",
      },
      {
        q: 'Working with district health authorities',
        a: 'Ndarinzwe operates in partnership with district health authorities across Rwanda. Your CHW activity on the platform — reminders set, messages sent, visits recorded — contributes to aggregated district-level data used to improve maternal health outcomes. Individual data is not shared with district offices without consent. For district-level enquiries, contact info@ndarinzwechw.com.',
      },
      {
        q: 'CHW programme affiliations and partnerships',
        a: 'Ndarinzwe works with the Rwanda Ministry of Health, Rwanda Biomedical Centre, and district health programmes to align with national maternal health targets. Our CHW tools are designed to complement existing training, supervision, and reporting frameworks. For questions about how Ndarinzwe fits your programme, contact us at info@ndarinzwechw.com.',
      },
    ],
  },
}

export default function HelpCHWCategoryPage() {
  const { slug } = useParams()
  const [openIdx, setOpenIdx] = useState(null)
  const [query, setQuery] = useState('')

  const section = HELP_CONTENT[slug]

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <HelpNavbar links={NAV_LINKS} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-24">
            <p className="text-lg font-bold text-navy mb-4">Article not found</p>
            <Link href="/help/chw" className="text-sm font-medium text-pink-primary underline underline-offset-2">
              Back to CHW Help Centre
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
      <HelpNavbar links={NAV_LINKS} />

      <section className="bg-pink-primary/10 px-6 md:px-16 py-10 md:py-14">
        <div className="max-w-3xl">
          <Link
            href="/help/chw"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/50 hover:text-navy mb-5 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            CHW Help Centre
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
              className="w-full bg-white border border-gray-200 rounded-[5px] pl-10 pr-4 py-3 text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20"
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

        <div className="mt-14 p-6 bg-pink-primary/10 rounded-[12px] text-center">
          <p className="text-sm font-bold text-navy mb-1">Still need help?</p>
          <p className="text-sm font-medium text-navy/60 mb-4">
            CHW support is available Monday to Friday, 8am–5pm CAT.
          </p>
          <a
            href="mailto:info@ndarinzwechw.com"
            className="inline-block px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity"
          >
            Email CHW Support
          </a>
        </div>
      </main>

      <p className="text-center text-sm font-medium text-gray-400 py-6">CHW Help Centre</p>
      <Footer />
    </div>
  )
}
