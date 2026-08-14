import Image from 'next/image'

export default function PrivacySection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Left — photo */}
          <div className="flex-1 w-full">
            <div className="w-full aspect-[4/3] rounded-[10px] overflow-hidden">
              <Image
                src="/images/photo-1661256545534-9770a8ea2146.avif"
                alt="Mother's health journey protected"
                width={600}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right — text */}
          <div className="flex-1 max-w-lg">
            <p className="text-sm font-medium text-pink-primary mb-3">
              Your Care, Your Privacy
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-5">
              Your Health Journey Stays Protected
            </h2>
            <p className="text-sm font-medium text-black leading-relaxed mb-8">
              Your personal health data is encrypted and shared only with the care providers you choose. Ndarinzwe is built in compliance with Rwanda&apos;s data protection law (Law No. 058/2021) and does not sell or pass your information to third parties. What you share stays between you and your care team.
            </p>
            <a
              href="/privacy"
              className="inline-block px-7 py-3 bg-navy text-white text-sm font-medium rounded-[5px] hover:opacity-90 transition-opacity"
            >
              Understand Your Privacy
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

