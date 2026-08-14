import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Cookies Policy | Ndarinzwe Health',
}

const SECTIONS = [
  {
    heading: '1. What Are Cookies?',
    body: `Cookies are small text files that are stored on your device (phone, tablet, or computer) when you visit a website or use a web-based platform. They allow the platform to recognise your device on return visits and remember certain information, such as whether you are logged in.

Ndarinzwe Health uses cookies and similar technologies to keep the platform working correctly, improve your experience, and understand how the platform is used. This policy explains what types of cookies we use and how you can control them.`,
  },
  {
    heading: '2. Types of Cookies We Use',
    body: `Essential (strictly necessary) cookies: these are required for Ndarinzwe to function. They manage your login session so you stay signed in as you move between pages. Without these cookies, the platform cannot work. These cookies cannot be disabled.

Preference cookies: these remember your settings — such as your preferred language (Kinyarwanda or English) — so you do not have to choose again each time you return.

Analytics cookies: these help us understand how Ndarinzwe is used — for example, which pages are most visited and where users encounter difficulties. We use this information to improve the platform. Analytics data is aggregated and does not identify you personally.

We do not use advertising cookies. Ndarinzwe does not serve targeted advertisements and does not share cookie data with advertising networks.`,
  },
  {
    heading: '3. How Long Cookies Last',
    body: `Session cookies: these are temporary and are deleted automatically when you close your browser or app. They are used to keep you logged in during a single visit.

Persistent cookies: these remain on your device for a set period (up to 12 months) or until you delete them. They are used to remember your language preference and certain account settings across visits.`,
  },
  {
    heading: '4. Third-Party Cookies',
    body: `Ndarinzwe may use third-party service providers for analytics (such as counting visits or errors) and for SMS delivery services. These providers may set their own cookies or use similar tracking technologies on our behalf.

We do not allow these third parties to use data collected through our platform for their own commercial purposes. They are contractually bound to handle data only as instructed by Ndarinzwe, in compliance with Rwanda's Law No. 058/2021 on the protection of personal data and privacy.`,
  },
  {
    heading: '5. Your Cookie Choices',
    body: `Essential cookies cannot be disabled as they are necessary for the platform to operate.

For all other cookies, you have the following choices:

Browser settings: most browsers allow you to view, manage, and delete cookies through their settings. Refer to your browser's help documentation for instructions. Note that disabling preference cookies may affect how the platform looks and behaves.

Device settings: if you access Ndarinzwe through a mobile app, your device's privacy settings may also offer options to limit tracking technologies.

Opting out of analytics: if you do not wish your usage to contribute to our anonymous analytics, contact us at info@ndarinzwe.com and we will record your preference.`,
  },
  {
    heading: '6. Cookies and Your Health Data',
    body: `Cookies on Ndarinzwe do not store your personal health data. Your pregnancy records, ANC visit history, and other health information are stored securely in our database — not in cookies on your device.

If you use a shared device (a phone used by multiple family members), we recommend logging out after each session to keep your account secure. Clearing cookies on a shared device also removes stored login sessions.`,
  },
  {
    heading: '7. Updates to This Policy',
    body: `We may update this Cookies Policy from time to time as the platform evolves. Changes will be reflected on this page with an updated date. Continued use of Ndarinzwe after an update constitutes acceptance of the revised policy.`,
  },
  {
    heading: '8. Contact',
    body: `If you have questions about cookies or this policy, contact us at:

Email: info@ndarinzwe.com

Ndarinzwe Health
Kigali, Rwanda`,
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-pink-primary/10 px-6 md:px-16 py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold text-pink-primary mb-3 uppercase tracking-wide">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-navy leading-snug mb-3">
            Cookies Policy
          </h1>
          <p className="text-sm font-medium text-black/60">
            Last updated: August 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-14">
        <p className="text-sm font-medium text-black leading-relaxed mb-12">
          This Cookies Policy explains how Ndarinzwe Health uses cookies and similar technologies when you
          use our platform. It should be read alongside our{' '}
          <Link href="/privacy" className="font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <div key={s.heading}>
              <h2 className="text-base font-bold text-navy mb-3">{s.heading}</h2>
              {s.body.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm font-medium text-black leading-relaxed mb-3 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
          <Link
            href="/privacy"
            className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors"
          >
            Privacy Policy →
          </Link>
          <Link
            href="/terms"
            className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors"
          >
            Terms of Use →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
