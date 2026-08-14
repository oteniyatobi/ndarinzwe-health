import Image from 'next/image'

export default function Hero() {
  return (
    <section className="bg-pink-primary/10 py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-4">

          {/* Left — copy */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-navy leading-tight mb-4 md:mb-5">
              Empowering Safe Motherhood Through Digital Support
            </h1>
            <p className="text-sm font-medium text-black leading-relaxed mb-8 max-w-md">
              Ndarinzwe — meaning &ldquo;let me be cared for&rdquo; in Kinyarwanda — connects pregnant women, new mothers, and Community Health Workers (Inshuti Mu Buzima) with the guidance and support they need, right from their phone.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/signup" className="px-6 py-3 bg-pink-primary text-white text-sm font-medium rounded-[5px] hover:opacity-90 transition-opacity">
                Get Started
              </a>
              <a href="#how-it-works" className="px-6 py-3 bg-navy text-white text-sm font-medium rounded-[5px] hover:opacity-90 transition-opacity">
                How It Works
              </a>
            </div>
          </div>

          {/* Right — illustration */}
          <div className="flex-1 flex justify-center items-end">
            <div className="relative w-56 h-64 md:w-80 md:h-96 lg:w-96 lg:h-[420px]">
              <Image
                src="/images/Animated SVJ 1.jpg"
                alt="Illustration of a pregnant woman"
                fill
                className="object-contain mix-blend-multiply"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
