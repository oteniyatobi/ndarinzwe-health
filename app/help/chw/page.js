'use client'

import { useState } from 'react'
import Link from 'next/link'
import HelpNavbar from '@/components/HelpNavbar'
import Footer from '@/components/Footer'

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Resources', href: '/resources' },
]

export default function HelpCHWPage() {
  const [search, setSearch] = useState('')

  const CATEGORIES = [
    { title: 'Getting Started', slug: 'getting-started', count: 7, icon: <PlayIcon /> },
    { title: 'My Account',      slug: 'my-account',      count: 6, icon: <UserIcon /> },
    { title: 'Reminders',       slug: 'reminders',       count: 7, icon: <BellIcon /> },
    { title: 'Our Support',     slug: 'our-support',     count: 7, icon: <SupportIcon /> },
    { title: 'Our Reviews',     slug: 'our-reviews',     count: 8, icon: <ReviewIcon /> },
    { title: 'Ndarinzwe',       slug: 'ndarinzwe',       count: 5, icon: <NdarinzweIcon /> },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HelpNavbar links={NAV_LINKS} />

      {/* Pink hero + search */}
      <section className="bg-pink-primary/10 px-6 md:px-16 py-10 md:py-14">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-5">
            Hello, how can we help?
          </h1>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for articles"
              className="w-full bg-white border border-gray-200 rounded-[5px] pl-11 pr-4 py-3.5 text-sm font-medium text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="bg-white py-12 px-6 md:px-16">
        <div className="max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href={`/help/chw/${cat.slug}`}
              className="border border-gray-200 rounded-[10px] py-8 px-6 flex flex-col items-center text-center hover:border-navy hover:shadow-sm transition-all"
            >
              <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center mb-4 text-navy">
                {cat.icon}
              </div>
              <p className="text-sm font-medium text-navy mb-1">{cat.title}</p>
              <p className="text-xs text-gray-400">{cat.count} articles</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Mother CTA */}
      <section className="px-6 md:px-16 pb-12">
        <div className="max-w-4xl bg-pink-primary/10 rounded-[10px] py-12 flex flex-col items-center text-center gap-6">
          <h2 className="text-2xl font-bold text-navy">Are you a Mother?</h2>
          <Link
            href="/help"
            className="px-8 py-3 bg-navy text-white text-sm font-medium rounded-[5px] hover:opacity-90 transition-opacity"
          >
            Mother&apos;s Help
          </Link>
        </div>
      </section>

      <p className="text-center text-sm font-medium text-gray-400 py-6">Help Centre</p>
      <Footer />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
function SupportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
function ReviewIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  )
}
function NdarinzweIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 7c-.6-1-1.8-1.8-3-.6a2.4 2.4 0 000 3L12 12l3-2.6a2.4 2.4 0 000-3c-1.2-1.2-2.4-.4-3 .6z" />
    </svg>
  )
}
