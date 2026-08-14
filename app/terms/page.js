import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Use | Ndarinzwe Health',
}

const SECTIONS = [
  {
    heading: '1. About Ndarinzwe',
    body: `Ndarinzwe Health ("Ndarinzwe," "we," "our," or "us") is a digital maternal health platform built for pregnant women, new mothers, and Community Health Workers (Inshuti Mu Buzima) in Rwanda. The name Ndarinzwe means "let me be cared for" in Kinyarwanda.

Ndarinzwe provides health information, pregnancy tracking, antenatal care (ANC) reminders, and a communication channel between mothers and their assigned Community Health Workers. The platform is available in both Kinyarwanda and English.

By registering for or using Ndarinzwe, you agree to these Terms of Use in full. If you do not agree to any part of these terms, please do not use the platform.`,
  },
  {
    heading: '2. Eligibility',
    body: `Ndarinzwe is designed for the following users:

Mothers: women who are currently pregnant or have recently given birth and are seeking maternal health support in Rwanda.

Community Health Workers (CHW): individuals formally appointed as Inshuti Mu Buzima under Rwanda's national Community Health Worker programme, affiliated with a recognised health sector in Rwanda.

By registering, you confirm that the information you provide during sign-up is accurate, and that you are eligible under the category in which you register. If you are under 18, we recommend that a parent or guardian reviews and agrees to these terms alongside you.`,
  },
  {
    heading: '3. Not a Substitute for Medical Care',
    body: `Ndarinzwe is a digital support tool. It is not a medical service, and it does not replace professional medical advice, diagnosis, or treatment.

All health content on Ndarinzwe is aligned with guidelines from Rwanda Ministry of Health (MoH) and the Rwanda Biomedical Centre (RBC). However, this content is general educational information only. Every pregnancy and health situation is different. If you have any concern about your health or your baby's health, consult a trained health provider or go to your nearest health facility — do not rely solely on information from this platform.

If you are experiencing a medical emergency, seek emergency care immediately. Do not use Ndarinzwe to report an emergency.`,
  },
  {
    heading: '4. Account Registration and Security',
    body: `To use Ndarinzwe, you must register for an account using your phone number and a password. You are responsible for keeping your login credentials confidential. Do not share your password with anyone, including your CHW.

You are responsible for all activity that takes place under your account. If you believe your account has been accessed without your permission, contact us immediately at info@ndarinzwe.com.

We reserve the right to suspend or terminate accounts where we believe terms have been violated or where false information was provided during registration.`,
  },
  {
    heading: '5. CHW–Mother Data Sharing',
    body: `When you link your account to a Community Health Worker, you consent to your pregnancy data — including your due date, gestational age, ANC records, and health notes — being visible to that CHW. This data sharing is the core mechanism by which your CHW can follow your progress and provide care between facility visits.

Your CHW is bound by professional obligations and Ndarinzwe's data policies. They must use your data solely to support your care.

If you unlink your CHW account, they will no longer be able to access new information. You can manage your CHW connection at any time through your account settings.`,
  },
  {
    heading: '6. Acceptable Use',
    body: `You agree to use Ndarinzwe only for its intended purpose: supporting maternal health during pregnancy and the postpartum period, or — for CHWs — supporting the mothers in your care.

You must not:

Use the platform to send abusive, harassing, or harmful messages to other users.

Attempt to gain unauthorised access to other users' accounts or to Ndarinzwe's systems.

Post or share false health information.

Use Ndarinzwe for any commercial purpose not authorised by us in writing.

Attempt to reverse-engineer, copy, or distribute any part of the Ndarinzwe platform.

We may suspend or terminate access for any violation of these terms without notice.`,
  },
  {
    heading: '7. Intellectual Property',
    body: `All content on Ndarinzwe — including text, images, icons, and the platform design — is the property of Ndarinzwe Health or is used under licence. You may not copy, reproduce, distribute, or create derivative works from Ndarinzwe content without our prior written permission.

Health content on the platform draws from Rwanda Ministry of Health guidelines, Rwanda Biomedical Centre (RBC) materials, and other publicly available verified sources. We credit these sources where required.`,
  },
  {
    heading: '8. Platform Availability',
    body: `We aim to keep Ndarinzwe available at all times, but we cannot guarantee uninterrupted access. The platform may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control including power or network outages in Rwanda.

We are not liable for any loss arising from the temporary unavailability of the platform. If the platform is unavailable and you need health advice urgently, contact your CHW directly by phone or go to your nearest health facility.`,
  },
  {
    heading: '9. Limitation of Liability',
    body: `To the fullest extent permitted by Rwandan law, Ndarinzwe Health shall not be liable for:

Any health outcome arising from reliance on information provided through the platform.

Loss of data due to circumstances beyond our reasonable control.

Any indirect, consequential, or incidental damages arising from your use of Ndarinzwe.

Nothing in these terms limits our liability for death or personal injury caused by our negligence, or for fraud.`,
  },
  {
    heading: '10. Changes to These Terms',
    body: `We may update these Terms of Use from time to time. When we make material changes, we will notify you by in-app notification or SMS. The date at the top of this page reflects the most recent update. Continued use of Ndarinzwe after changes take effect constitutes acceptance of the revised terms.

If you do not agree to the updated terms, you may close your account by contacting us at info@ndarinzwe.com.`,
  },
  {
    heading: '11. Governing Law',
    body: `These Terms of Use are governed by and construed in accordance with the laws of the Republic of Rwanda. Any dispute arising under these terms shall be subject to the jurisdiction of Rwandan courts.`,
  },
  {
    heading: '12. Contact',
    body: `For any questions about these Terms of Use, contact us at:

Email: info@ndarinzwe.com

Ndarinzwe Health
Kigali, Rwanda`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-pink-primary/10 px-6 md:px-16 py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold text-pink-primary mb-3 uppercase tracking-wide">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-navy leading-snug mb-3">
            Terms of Use
          </h1>
          <p className="text-sm font-medium text-black/60">
            Last updated: August 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-14">
        <p className="text-sm font-medium text-black leading-relaxed mb-12">
          These Terms of Use govern your access to and use of the Ndarinzwe Health platform. Please read
          them carefully before registering or using the platform. By creating an account, you agree to
          be bound by these terms.
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
            href="/cookies"
            className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors"
          >
            Cookies Policy →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
