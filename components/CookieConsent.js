'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = localStorage.getItem('cookie-consent')
    if (!choice) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-navy text-white rounded-[12px] px-6 py-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="flex-1">
          <p className="text-sm font-bold mb-1">We use cookies</p>
          <p className="text-xs font-medium text-white/70 leading-relaxed">
            Ndarinzwe uses essential cookies to keep you logged in and to remember your preferences. We do not use advertising or tracking cookies.{' '}
            <Link href="/privacy" className="underline underline-offset-2 text-white/90 hover:text-white transition-colors">
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-5 py-2 text-xs font-bold border border-white/30 rounded-[5px] hover:border-white/60 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-xs font-bold bg-pink-primary text-white rounded-[5px] hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
