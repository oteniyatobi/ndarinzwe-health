'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0" onClick={() => setOpen(false)}>
          <Image
            src="/images/logo.png"
            alt="Ndarinzwe Health"
            width={180}
            height={48}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/about" className="text-sm font-medium text-black hover:text-navy transition-colors">About</Link>
          <Link href="/help" className="text-sm font-medium text-black hover:text-navy transition-colors">Help</Link>
          <Link href="/resources" className="text-sm font-medium text-black hover:text-navy transition-colors">Resources</Link>
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="px-5 py-2 text-sm font-medium text-pink-primary border border-pink-primary rounded-[5px] hover:bg-pink-primary hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="px-5 py-2 text-sm font-medium text-white bg-navy rounded-[5px] hover:opacity-90 transition-opacity">
            Sign up
          </Link>
        </div>

        {/* Mobile: Log in + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className="px-4 py-1.5 text-sm font-medium text-pink-primary border border-pink-primary rounded-[5px]">
            Log in
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="p-2 rounded-[5px] text-navy hover:bg-gray-100 transition-colors"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-5 flex flex-col gap-4">
          <Link href="/about" onClick={() => setOpen(false)} className="text-sm font-medium text-black hover:text-navy transition-colors py-1">About</Link>
          <Link href="/help" onClick={() => setOpen(false)} className="text-sm font-medium text-black hover:text-navy transition-colors py-1">Help</Link>
          <Link href="/resources" onClick={() => setOpen(false)} className="text-sm font-medium text-black hover:text-navy transition-colors py-1">Resources</Link>
          <div className="pt-2 border-t border-gray-100">
            <Link href="/signup" onClick={() => setOpen(false)} className="block w-full text-center px-5 py-2.5 text-sm font-bold text-white bg-navy rounded-[5px]">
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
