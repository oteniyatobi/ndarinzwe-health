import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="Ndarinzwe Health"
            width={180}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/about" className="text-sm font-medium text-black hover:text-navy transition-colors">
            About
          </Link>
          <Link href="/help" className="text-sm font-medium text-black hover:text-navy transition-colors">
            Help
          </Link>
          <Link href="/resources" className="text-sm font-medium text-black hover:text-navy transition-colors">
            Resources
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-pink-primary border border-pink-primary rounded-[5px] hover:bg-pink-primary hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-medium text-white bg-navy rounded-[5px] hover:opacity-90 transition-opacity"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  )
}
