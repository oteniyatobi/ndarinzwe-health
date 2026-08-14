'use client'

import { useState } from 'react'

const LANGUAGES = ['Kinyarwanda', 'English']

export default function LanguageSelector() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('Language')

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-black hover:text-navy transition-colors"
      >
        {selected}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 6"
          fill="none"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-[5px] shadow-md z-50 min-w-[140px]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => { setSelected(lang); setOpen(false) }}
                className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-pink-primary/10 transition-colors"
              >
                {lang}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
