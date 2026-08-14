import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Ndarinzwe Health',
}

const SECTIONS = [
  {
    heading: '1. Who We Are',
    body: `Ndarinzwe Health ("Ndarinzwe," "we," "our," or "us") is a digital maternal health platform based in Rwanda. Our platform supports pregnant women, new mothers, and Community Health Workers (Inshuti Mu Buzima) by providing health information, pregnancy tracking, antenatal care (ANC) reminders, and a channel for communication between mothers and their assigned CHW.

The name Ndarinzwe means "let me be cared for" in Kinyarwanda. We take that responsibility seriously, including when it comes to your personal data.

For privacy enquiries, contact us at: info@ndarinzwe.com`,
  },
  {
    heading: '2. Legal Framework',
    body: `This Privacy Policy is prepared in compliance with Rwanda's Law No. 058/2021 of 13/10/2021 relating to the protection of personal data and privacy ("the Data Protection Law"). We are committed to processing your personal data lawfully, fairly, and transparently in accordance with Rwandan law.

By registering for and using Ndarinzwe, you acknowledge that you have read and understood this Privacy Policy and consent to the processing of your personal data as described herein.`,
  },
  {
    heading: '3. What Personal Data We Collect',
    body: `When you register and use Ndarinzwe, we collect the following categories of personal data:

Identity and contact information: your full name, phone number, and date of birth. An email address is optional.

Pregnancy and health data: your expected due date, gestational age, number of previous pregnancies, records of antenatal care (ANC) visits attended, and any health notes or symptom records you choose to log in the platform.

Location data: your village, sector, and district in Rwanda. We collect this to match you with the correct Community Health Worker for your area and to provide locally relevant information. We do not collect real-time GPS location.

CHW assignment data: your linked Community Health Worker's identifier and sector, so that your CHW can view your pregnancy information and provide appropriate care.

Account credentials: a password, which is stored in encrypted (hashed) form. We never store or see your plain-text password.

Device and usage data: basic information about the device and browser type you use, and which features you access. This data is collected in aggregate to help us improve the platform and is not linked to your personal identity.`,
  },
  {
    heading: '4. How We Use Your Data',
    body: `We use your personal data for the following purposes:

To provide the Ndarinzwe service: creating your account, displaying your pregnancy information, sending you ANC reminders and health guidance, and enabling communication with your linked CHW.

To connect you with your Community Health Worker: your name, phone number, pregnancy data, and ANC visit records are visible to your assigned CHW (Inshuti Mu Buzima) so they can follow your progress, check in between facility visits, and support your care. You consent to this sharing when you link your account to a CHW.

To send you health reminders: we use your phone number to send SMS or in-app reminders for upcoming ANC appointments, vaccination schedules, and postnatal check-ups, based on your expected due date.

To improve the platform: anonymised and aggregated usage data helps us understand which features are most useful and where we can improve. No personally identifiable information is used for this purpose.

To comply with legal obligations: we may process data where required by Rwandan law or as directed by competent public health authorities, in accordance with Rwanda's Law No. 058/2021.`,
  },
  {
    heading: '5. Data Sharing',
    body: `Ndarinzwe does not sell your personal data to any third party.

Your data may be shared with:

Your assigned Community Health Worker (Inshuti Mu Buzima): as described above, your CHW can see your pregnancy records to support your care. If you unlink your CHW, they will no longer have access to new data.

Health facilities: in limited circumstances, your aggregated or individual health data may be shared with your registered health facility if required for your direct care and with your knowledge.

Technology service providers: we use trusted third-party service providers for cloud hosting, SMS delivery, and platform analytics. These providers are contractually bound to handle your data only as instructed by Ndarinzwe and in compliance with applicable law.

Government authorities: if required by Rwandan law, court order, or for the protection of public health under Rwanda Ministry of Health directions, we may disclose data. We will inform you where legally permitted to do so.`,
  },
  {
    heading: '6. Data Retention',
    body: `We retain your personal data for as long as your account is active. If you request deletion of your account, we will delete or anonymise your personal data within 30 days of receiving the request, except where we are required to retain certain data by law.

Anonymised and aggregated data (which cannot identify you) may be retained indefinitely to support platform improvement and public health reporting.`,
  },
  {
    heading: '7. Your Rights',
    body: `Under Rwanda's Law No. 058/2021, you have the following rights with respect to your personal data:

Right of access: you may request a copy of the personal data we hold about you.

Right to rectification: if any data we hold is inaccurate or incomplete, you may ask us to correct it.

Right to erasure: you may request that we delete your personal data. We will comply unless we have a legal obligation to retain certain data.

Right to object: you may object to the processing of your personal data for certain purposes.

Right to withdraw consent: where processing is based on your consent, you may withdraw it at any time. This will not affect the lawfulness of processing before withdrawal.

To exercise any of these rights, contact us at info@ndarinzwe.com. We will respond within 30 days.`,
  },
  {
    heading: '8. Security',
    body: `We take the security of your data seriously. Ndarinzwe uses encryption in transit (HTTPS) and at rest for sensitive data including passwords and health records. Access to personal data within our team is limited to staff who need it to perform their role.

Despite these measures, no digital system can guarantee absolute security. If you suspect a breach involving your account, contact us immediately at info@ndarinzwe.com.`,
  },
  {
    heading: '9. Children',
    body: `Ndarinzwe is intended for users who are pregnant, postpartum, or registered Community Health Workers. Where a user is under 18, we recommend that a parent or guardian also review and consent to the use of the platform. We do not knowingly collect data from children under the age of 16 who are not pregnant.`,
  },
  {
    heading: '10. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by in-app notification or SMS. The date at the top of this page reflects the date of the most recent update. Continued use of Ndarinzwe after changes take effect constitutes acceptance of the revised policy.`,
  },
  {
    heading: '11. Contact Us',
    body: `If you have questions about this Privacy Policy or your personal data, please contact us:

Email: info@ndarinzwe.com

Ndarinzwe Health
Kigali, Rwanda`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-pink-primary/10 px-6 md:px-16 py-14 md:py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold text-pink-primary mb-3 uppercase tracking-wide">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-navy leading-snug mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm font-medium text-black/60">
            Last updated: August 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 py-14">
        <p className="text-sm font-medium text-black leading-relaxed mb-12">
          This Privacy Policy explains how Ndarinzwe Health collects, uses, shares, and protects your
          personal data when you use our platform. It applies to all users — pregnant women, new mothers,
          and Community Health Workers (Inshuti Mu Buzima).
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
            href="/terms"
            className="text-sm font-bold text-navy underline underline-offset-2 hover:text-pink-primary transition-colors"
          >
            Terms of Use →
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
