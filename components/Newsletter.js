'use client'

import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="bg-navy py-14 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Left */}
          <div className="md:max-w-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Subscribe To Our Newsletter
            </h2>
            <p className="text-sm font-medium text-white/70">
              Be the first to receive tips and updates.
            </p>
          </div>

          {/* Right — form */}
          {submitted ? (
            <p className="text-white font-medium text-sm">
              Thank you for subscribing!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full md:max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-[10px] text-sm font-medium text-black placeholder-gray-400 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-pink-primary"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-6 py-3 bg-pink-primary text-white text-sm font-medium rounded-[5px] hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-white/40 mt-4 text-center md:text-right">
          By subscribing you agree to our Privacy Policy.
        </p>
      </div>
    </section>
  )
}
