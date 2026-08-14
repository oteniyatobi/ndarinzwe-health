'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import HelpNavbar from '@/components/HelpNavbar'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'
import { getArticleBySlug, getRelatedArticles } from '@/lib/articles'

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Resources', href: '/resources' },
]

export default function ArticlePage({ params }) {
  const [search, setSearch] = useState('')
  const article = getArticleBySlug(params.slug)

  if (!article) notFound()

  const related = getRelatedArticles(params.slug)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HelpNavbar links={NAV_LINKS} />

      {/* Pink hero + search */}
      <section className="bg-pink-primary/10 px-6 md:px-16 py-10 md:py-14">
        <div className="max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-5">
            Hello, how can we help?
          </h2>
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

      {/* Article body */}
      <main className="max-w-4xl mx-auto w-full px-6 md:px-10 py-10 md:py-14 flex-1">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-medium text-black mb-8">
          <Link href="/resources" className="font-bold text-navy hover:underline">
            Resources
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-black/60">{article.title}</span>
        </nav>

        {/* Title + meta */}
        <h1 className="text-3xl md:text-4xl font-bold text-navy leading-snug mb-3">
          {article.title}
        </h1>
        <p className="text-sm font-medium text-black/60 mb-2">{article.question}</p>
        <p className="text-sm font-medium text-pink-primary mb-8">{article.date}</p>

        {/* Hero image */}
        <div className="relative w-full h-56 md:h-80 rounded-[10px] overflow-hidden mb-10 bg-pink-primary/10">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article sections */}
        <div className="space-y-8">
          {article.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-base font-bold text-navy mb-3">{section.heading}</h2>
              {section.body.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm font-medium text-black leading-relaxed mb-3 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Related articles */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-navy mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/resources/${r.slug}`}
                className="bg-white rounded-[10px] overflow-hidden border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="bg-pink-primary/10 h-36 relative flex-shrink-0">
                  <Image
                    src={r.image}
                    alt={r.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-navy mb-2 leading-snug">{r.title}</h3>
                  <p className="text-xs font-medium text-black/60 leading-relaxed mb-3 flex-1 line-clamp-3">
                    {r.excerpt}
                  </p>
                  <span className="text-xs font-bold text-navy underline underline-offset-2">
                    Read articles
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Newsletter />
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
