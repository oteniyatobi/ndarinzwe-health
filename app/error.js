'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-sm">
        <p className="text-sm font-bold text-pink-primary mb-3">Something went wrong</p>
        <h1 className="text-2xl font-bold text-navy mb-4">This page couldn&apos;t load</h1>
        <p className="text-sm font-medium text-black/60 mb-8 leading-relaxed">
          We&apos;re sorry about that. Try refreshing the page, or go back to the home page.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-[5px] hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 border border-navy text-navy text-sm font-bold rounded-[5px] hover:bg-navy hover:text-white transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
