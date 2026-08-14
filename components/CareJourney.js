import Image from 'next/image'

const cards = [
  {
    title: 'Health Information',
    body: 'Read trusted maternal and newborn health content in Kinyarwanda or English, sourced from Rwanda Ministry of Health and RBC guidelines. No guesswork, no misinformation.',
    image: '/images/Animated SVJ 3.jpg',
    alt: 'Illustration of a pregnant woman viewing health information on her phone',
  },
  {
    title: 'Pregnancy Tracking',
    body: 'Follow your pregnancy week by week. Get ANC visit reminders, milestone updates, and a danger-signs checklist tailored to your stage of pregnancy.',
    image: '/images/Animated SVJ 1.jpg',
    alt: 'Illustration of a pregnant woman with hands on belly',
  },
  {
    title: 'Connected Care',
    body: 'Message your CHW (Inshuti Mu Buzima) directly through the app. Stay supported between clinic visits and know who to call when something feels wrong.',
    image: '/images/Animated SVJ 2.jpg',
    alt: 'Illustration of a pregnant woman talking on her phone with her CHW',
  },
]

export default function CareJourney() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-10 md:mb-24">
          Care For Every Journey
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card) => (
            <div key={card.title} className="md:relative">

              {/* Mobile layout — image inline above card */}
              <div className="md:hidden flex flex-col items-center">
                <div className="relative w-40 h-40 mb-4">
                  <Image src={card.image} alt={card.alt} fill className="object-contain mix-blend-multiply" />
                </div>
                <div className="w-full bg-pink-primary/10 rounded-[10px] p-6 text-center">
                  <h3 className="text-base font-bold text-navy mb-3">{card.title}</h3>
                  <p className="text-sm font-medium text-black leading-relaxed mb-5">{card.body}</p>
                  <a href="#" className="px-6 py-2 border border-navy text-navy text-sm font-medium rounded-[5px] hover:bg-navy hover:text-white transition-colors inline-block">
                    Learn More
                  </a>
                </div>
              </div>

              {/* Desktop layout — image overflows above */}
              <div className="hidden md:block">
                <div className="absolute -top-24 inset-x-0 flex justify-center z-10 pointer-events-none">
                  <div className="relative w-48 h-48">
                    <Image src={card.image} alt={card.alt} fill className="object-contain mix-blend-multiply" />
                  </div>
                </div>
                <div className="bg-pink-primary/10 rounded-[10px] pt-28 pb-8 px-6 flex flex-col items-center text-center min-h-[260px]">
                  <h3 className="text-base font-bold text-navy mb-3">{card.title}</h3>
                  <p className="text-sm font-medium text-black leading-relaxed mb-6 flex-1">{card.body}</p>
                  <a href="#" className="px-6 py-2 border border-navy text-navy text-sm font-medium rounded-[5px] hover:bg-navy hover:text-white transition-colors">
                    Learn More
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
