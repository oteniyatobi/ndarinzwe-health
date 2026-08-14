import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'About — Ndarinzwe Health',
  description: 'Learn how Ndarinzwe Health is supporting safe motherhood across Rwanda through digital tools and community health workers.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#FFF0F6] px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-navy leading-tight mb-6">
              Supporting Every Pregnancy Through Better Care
            </h1>
            <p className="text-base font-medium text-black/60 leading-relaxed mb-8">
              Ndarinzwe Health connects pregnant women and new mothers in Rwanda with trusted health information, community health workers, and the tools they need for a safe and informed pregnancy journey.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3.5 bg-pink-primary text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
          <div className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80 rounded-[16px] overflow-hidden">
            <Image
              src="/images/istockphoto-182505788-612x612.webp"
              alt="Pregnant mother holding her belly"
              width={320}
              height={320}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 md:px-10 py-20 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-shrink-0 w-64 h-64 md:w-72 md:h-72 rounded-[16px] overflow-hidden">
            <Image
              src="/images/photo-1746766414005-ee349f5f12bf.avif"
              alt="Mother and community health worker"
              width={288}
              height={288}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-5">
              Building Better Pregnancy Care For Everyone
            </h2>
            <p className="text-base font-medium text-black/60 leading-relaxed">
              We believe every mother in Rwanda deserves access to quality maternal care — regardless of where she lives. Ndarinzwe bridges the gap between community health workers and the mothers they serve, creating a connected, informed care network that works from registration to postpartum recovery.
            </p>
          </div>
        </div>
      </section>

      {/* Our Service */}
      <section className="bg-gray-50 px-6 md:px-10 py-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-bold text-pink-primary mb-3">Our Service</p>
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-10 max-w-2xl">
            Ndarinzwe helps mothers stay informed, connected, and supported throughout every stage of pregnancy.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Health Information',
                body: 'Reliable, Rwanda-specific maternal health content sourced from the Ministry of Health and Rwanda Biomedical Centre — available in Kinyarwanda and English.',
              },
              {
                title: 'Pregnancy Tracking',
                body: 'Mothers can track their pregnancy week by week, log ANC visits, receive reminders, and monitor their baby\'s development milestones.',
              },
              {
                title: 'Better Tools For Your Maternal Care',
                body: 'From due-date calculators to CHW location tools, Ndarinzwe gives every mother practical, easy-to-use tools for safer pregnancy outcomes.',
              },
            ].map((s) => (
              <div key={s.title} className="bg-white border border-gray-200 rounded-[10px] p-6">
                <h3 className="text-base font-bold text-navy mb-3">{s.title}</h3>
                <p className="text-sm font-medium text-black/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-10 py-20 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="flex-1 max-w-xs">
            <h2 className="text-3xl font-bold text-navy leading-tight">
              Everything needed for a healthier pregnancy
            </h2>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                icon: <TrustedIcon />,
                title: 'Trusted Information',
                body: 'All health content is sourced from the Ministry of Health Rwanda and Rwanda Biomedical Centre — no fabricated or generic advice.',
              },
              {
                icon: <PrivacyIcon />,
                title: 'Privacy First',
                body: 'Your health data is protected under Rwanda Law No. 058/2021 on personal data protection. You control what is shared.',
              },
              {
                icon: <SupportIcon />,
                title: 'Continuous Support',
                body: 'Community health workers are available to follow up, answer questions, and provide in-person care where needed.',
              },
              {
                icon: <MothersIcon />,
                title: 'Built For Mothers',
                body: 'Designed with Rwandan mothers in mind — bilingual, mobile-friendly, and built around real care journeys.',
              },
            ].map((f) => (
              <div key={f.title}>
                <div className="w-10 h-10 rounded-full bg-[#FFF0F6] flex items-center justify-center text-navy mb-3">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-navy mb-1.5">{f.title}</h3>
                <p className="text-sm font-medium text-black/60 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy CTA */}
      <section className="bg-[#FFF0F6] mx-6 md:mx-10 mb-16 rounded-[16px] px-5 md:px-14 py-14">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-shrink-0 w-48 h-48 rounded-[16px] overflow-hidden">
            <Image
              src="/images/Animated SVJ 2.jpg"
              alt="Mother using Ndarinzwe on her phone"
              width={192}
              height={192}
              className="w-full h-full object-contain bg-[#FFF0F6]"
            />
          </div>
          <div className="flex-1 max-w-lg">
            <p className="text-sm font-bold text-pink-primary mb-3">Your Care, Your Privacy</p>
            <h2 className="text-3xl font-bold text-navy leading-tight mb-5">
              Together With Ndarinzwe For Better Maternal Care
            </h2>
            <p className="text-base font-medium text-black/60 leading-relaxed mb-8">
              Join thousands of mothers and community health workers across Rwanda who are using Ndarinzwe to make every pregnancy safer and more supported.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function TrustedIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function PrivacyIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
}
function SupportIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function MothersIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
}
