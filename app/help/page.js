'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const CATEGORIES = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    count: 7,
    icon: <PlayIcon />,
    articles: [
      'How to create an account',
      'Setting up your pregnancy profile',
      'Understanding your dashboard',
      'Linking to a Community Health Worker',
      'How to enter your LMP date',
      'Changing your language settings',
      'Getting your first ANC reminder',
    ],
  },
  {
    slug: 'my-account',
    title: 'My Account',
    count: 6,
    icon: <UserIcon />,
    articles: [
      'How to update your profile',
      'Changing your password',
      'Managing privacy settings',
      'Deleting your account',
      'Resetting your login details',
      'Verifying your email address',
    ],
  },
  {
    slug: 'reminders',
    title: 'Reminders',
    count: 7,
    icon: <BellIcon />,
    articles: [
      'How reminders work',
      'Setting a custom reminder',
      'ANC visit reminders',
      'Medication reminders',
      'Turning off a reminder',
      'Why am I not receiving reminders?',
      'Reminder notification settings',
    ],
  },
  {
    slug: 'our-support',
    title: 'Our Support',
    count: 7,
    icon: <SupportIcon />,
    articles: [
      'How to contact support',
      'Speaking with your CHW',
      'Reporting a problem',
      'Emergency contacts in Rwanda',
      'What to do in a health emergency',
      'Accessibility support',
      'Language assistance',
    ],
  },
  {
    slug: 'our-reviews',
    title: 'Our Reviews',
    count: 8,
    icon: <StarIcon />,
    articles: [
      'What mothers say about Ndarinzwe',
      'CHW feedback and success stories',
      'How we use your feedback',
      'Rating your experience',
      'Submitting a review',
      'Community testimonials',
      'Partner organisation feedback',
      'Impact report highlights',
    ],
  },
  {
    slug: 'ndarinzwe',
    title: 'Ndarinzwe',
    count: 5,
    icon: <NdarinzweIcon />,
    articles: [
      'What is Ndarinzwe Health?',
      'Our mission and values',
      'How we protect your data',
      'Working with the Ministry of Health',
      'Partnerships and affiliations',
    ],
  },
]

export default function HelpPage() {
  const [query, setQuery] = useState('')

  const filtered = CATEGORIES.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.articles.some((a) => a.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#FFF0F6] px-6 md:px-10 py-14">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Hello, how can we help?
          </h1>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for articles"
              className="w-full pl-11 pr-5 py-4 bg-white border border-gray-200 rounded-[10px] text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 md:px-10 py-16 max-w-7xl mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-gray-400">No results for &ldquo;{query}&rdquo;</p>
            <button onClick={() => setQuery('')} className="mt-3 text-sm font-bold text-navy underline underline-offset-2">
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filtered.map((cat) => (
              <Link
                key={cat.slug}
                href={`/help/${cat.slug}`}
                className="bg-white border border-gray-200 rounded-[10px] p-7 flex flex-col items-center text-center hover:border-navy/30 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-navy mb-4 group-hover:border-navy/40 transition-colors">
                  {cat.icon}
                </div>
                <p className="text-base font-bold text-navy mb-1">{cat.title}</p>
                <p className="text-sm font-medium text-gray-400">{cat.count} articles</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CHW banner */}
      <section className="bg-[#FFF0F6] mx-6 md:mx-10 rounded-[16px] px-8 py-12 text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
          Are you a Community Health Worker?
        </h2>
        <Link
          href="/help/chw"
          className="inline-block px-8 py-3.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity"
        >
          CHW Help
        </Link>
      </section>

      {/* Help Centre heading — bottom teaser */}
      <div className="text-center pb-8">
        <h2 className="text-2xl font-bold text-navy">Help Centre</h2>
      </div>

      <Footer />
    </div>
  )
}

/* ── Icons ─────────────────────────────────────────────────────── */
function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function PlayIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
}
function UserIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function BellIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
}
function SupportIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function StarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function NdarinzweIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
}
