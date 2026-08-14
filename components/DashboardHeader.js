'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardHeader({ name }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const firstName = name?.split(' ')[0] || 'Account'

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="Ndarinzwe Health"
            width={160}
            height={44}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* Bell */}
          <button
            aria-label="Notifications"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-pink-primary text-pink-primary hover:bg-pink-primary/5 transition-colors"
          >
            <BellIcon />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-2 border border-pink-primary rounded-[5px] text-sm font-medium text-pink-primary hover:bg-pink-primary/5 transition-colors"
            >
              {firstName}
              <ChevronIcon open={open} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-[10px] shadow-lg py-1 z-40">
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2.5 text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-gray-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
