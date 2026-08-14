import Image from 'next/image'

const steps = [
  {
    num: '1',
    title: 'Create Your Account',
    body: 'Register with your phone number in Kinyarwanda or English. Choose whether you are a pregnant woman, new mother, or Community Health Worker (Inshuti Mu Buzima).',
  },
  {
    num: '2',
    title: 'Complete Your Profile',
    body: 'Enter your estimated due date, your nearest health facility, and your CHW code. Ndarinzwe builds a personalised care plan around your specific situation.',
  },
  {
    num: '3',
    title: 'Access Your Dashboard',
    body: 'See your weekly pregnancy guide, upcoming ANC visit reminders, and a danger-signs checklist — all aligned with Rwanda Ministry of Health guidelines.',
  },
  {
    num: '4',
    title: 'Stay Connected',
    body: 'Receive timely reminders, share updates with your CHW between facility visits, and track every milestone from first trimester through postpartum.',
  },
]

const nodes = [
  { label: 'Baby Growth',        color: '#2EC4B6', top: '22%', left: '73%' },
  { label: 'Danger Signs',       color: '#FA5091', top: '56%', left: '86%' },
  { label: 'ANC Reminders',      color: '#4B9CD3', top: '81%', left: '68%' },
  { label: 'Pregnancy Tracking', color: '#9B8EC4', top: '81%', left: '32%' },
  { label: 'CHW Support',        color: '#FA5091', top: '56%', left: '15%' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-pink-primary/10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">How Ndarinzwe Works</h2>
          <p className="text-sm font-medium text-black max-w-md mx-auto leading-relaxed">
            Getting started takes just a few minutes. Here is how Ndarinzwe supports you from sign-up to connected care.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20">

          {/* Steps list */}
          <div className="flex-1 max-w-sm w-full">
            <ol className="space-y-6">
              {steps.map((step) => (
                <li key={step.num} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {step.num}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-navy mb-1">{step.title}</p>
                    <p className="text-sm font-medium text-black leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a href="/signup" className="mt-10 inline-block px-7 py-3 bg-navy text-white text-sm font-medium rounded-[5px] hover:opacity-90 transition-opacity">
              Start Your Journey
            </a>
          </div>

          {/* Feature tags — mobile: simple pill grid; desktop: circular diagram */}
          <div className="flex-1 flex justify-center w-full">

            {/* Mobile: pill grid */}
            <div className="md:hidden w-full">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <Image src="/images/Animated SVJ 1.jpg" alt="Pregnant woman illustration" fill className="object-contain mix-blend-multiply" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {nodes.map((node) => (
                  <span
                    key={node.label}
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: node.color }}
                  >
                    {node.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Desktop: circular diagram */}
            <div className="hidden md:flex justify-center pb-10">
              <div className="relative w-80 h-80 overflow-visible">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-pink-primary/30" />
                <div className="absolute inset-[15%] rounded-full bg-pink-primary/10 shadow-md flex items-center justify-center overflow-hidden">
                  <Image src="/images/Animated SVJ 1.jpg" alt="Pregnant woman illustration" fill className="object-cover mix-blend-multiply scale-110" />
                </div>
                {nodes.map((node) => (
                  <div
                    key={node.label}
                    className="absolute flex flex-col items-center gap-1"
                    style={{ top: node.top, left: node.left, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: node.color }}>
                      <span className="text-white text-[9px] font-bold text-center leading-tight px-1">
                        {node.label.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-navy text-center leading-tight w-16">{node.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
