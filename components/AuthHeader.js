import Image from 'next/image'
import Link from 'next/link'

export default function AuthHeader() {
  return (
    <header className="w-full bg-white py-4 px-6 md:px-10 flex items-center justify-between border-b border-gray-100">
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
      <p className="text-sm font-medium text-black">
        Community Health Worker or Mother?{' '}
        <Link href="/about" className="font-bold text-navy underline underline-offset-2">
          Learn about joining
        </Link>
      </p>
    </header>
  )
}
