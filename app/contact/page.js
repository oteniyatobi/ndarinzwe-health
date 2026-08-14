'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [bannerOpen, setBannerOpen] = useState(true)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Privacy banner */}
      {bannerOpen && (
        <div className="bg-[#FFF0F6] border-b border-pink-primary/20 px-6 pr-12 py-3 flex items-center justify-center gap-2 text-sm font-medium text-navy relative">
          Your data privacy matters.{' '}
          <Link href="/privacy" className="underline underline-offset-2 font-bold hover:text-pink-primary transition-colors">
            Manage privacy choices
          </Link>
          <button
            onClick={() => setBannerOpen(false)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-navy/50 hover:text-navy transition-colors font-bold"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <Navbar />

      {/* Hero */}
      <section className="bg-[#FFF0F6] px-6 md:px-10 py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-5">
              We're Here To Support Your Journey
            </h1>
            <p className="text-base font-medium text-black/60 leading-relaxed">
              Whether you have a question about your pregnancy, need help with your account, or want to know more about how Ndarinzwe works — our team is ready to help.
            </p>
          </div>
          <div className="flex-shrink-0 w-56 h-64 rounded-[16px] overflow-hidden">
            <Image
              src="/images/photo-1761370980657-22586ea44093.avif"
              alt="Mother reaching out for support"
              width={224}
              height={256}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="px-6 md:px-10 py-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email */}
          <ContactCard icon={<EmailIcon />} title="Send us an Email">
            <p className="text-sm font-medium text-black/60 leading-relaxed mb-5">
              Reach our team by email any time. We aim to respond within one business day.
            </p>
            <ContactDetail label="Mother:" href="mailto:info@ndarinzwe.com" value="info@ndarinzwe.com" />
            <ContactDetail label="CHW:" href="mailto:info@ndarinzwechw.com" value="info@ndarinzwechw.com" />
          </ContactCard>

          {/* Phone */}
          <ContactCard icon={<PhoneIcon />} title="Give us a call">
            <p className="text-sm font-medium text-black/60 leading-relaxed mb-5">
              Speak directly with a member of our support team during working hours (Mon–Fri, 8am–5pm CAT).
            </p>
            <ContactDetail label="Mother:" href="tel:+250712345678" value="+250 712 345 678" />
            <ContactDetail label="CHW:" href="tel:+250776543210" value="+250 776 543 210" />
          </ContactCard>

          {/* SMS */}
          <ContactCard icon={<SmsIcon />} title="Send us an SMS">
            <p className="text-sm font-medium text-black/60 leading-relaxed mb-5">
              Prefer a text message? Send us an SMS and a team member will follow up as soon as possible.
            </p>
            <ContactDetail label="Mother:" href="sms:+250712345678" value="+250 712 345 678" />
            <ContactDetail label="CHW:" href="sms:+250776543210" value="+250 776 543 210" />
          </ContactCard>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-[#FFF0F6] mx-6 md:mx-10 mb-16 rounded-[16px] px-5 md:px-14 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-navy">Become a part of us today</h2>
          <Link
            href="/signup"
            className="px-8 py-3.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ContactCard({ icon, title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] p-6">
      <div className="w-12 h-12 rounded-full bg-[#FFF0F6] flex items-center justify-center text-navy mb-5">
        {icon}
      </div>
      <h2 className="text-base font-bold text-navy mb-3">{title}</h2>
      {children}
    </div>
  )
}

function ContactDetail({ label, href, value }) {
  return (
    <div className="flex items-center gap-2 mb-2 last:mb-0">
      <span className="text-sm font-bold text-navy">{label}</span>
      <a href={href} className="text-sm font-medium text-pink-primary hover:underline transition-colors">
        {value}
      </a>
    </div>
  )
}

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  )
}

function SmsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      <line x1="9" y1="10" x2="9.01" y2="10"/>
      <line x1="12" y1="10" x2="12.01" y2="10"/>
      <line x1="15" y1="10" x2="15.01" y2="10"/>
    </svg>
  )
}
