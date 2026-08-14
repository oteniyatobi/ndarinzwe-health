import Image from 'next/image'
import Link from 'next/link'

export default function HelpNavbar({ links }) {
  return (
    <nav className="w-full bg-white py-4 px-6 md:px-10 flex items-center justify-between">
      <Link href="/">
        <Image
          src="/images/logo.png"
          alt="Ndarinzwe Health"
          width={160}
          height={44}
          className="h-10 w-auto"
          priority
        />
      </Link>

      <div className="flex items-center gap-8 md:gap-10">
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="hidden md:block text-sm font-medium text-black hover:text-navy transition-colors"
          >
            {l.label}
          </Link>
        ))}
        <div className="hidden md:block w-px h-5 bg-gray-300" />
        <Link
          href="/contact"
          className="px-5 py-2 text-sm font-medium text-white bg-navy rounded-[5px] hover:opacity-90 transition-opacity"
        >
          Contact Us
        </Link>
      </div>
    </nav>
  )
}
