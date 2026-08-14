export default function YourCare() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-14">
          Your Care, Your Way
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mother card */}
          <div className="bg-pink-primary/10 rounded-[10px] p-8 md:p-10">
            <h3 className="text-xl font-bold text-navy mb-4">
              Personalized Pregnancy Support
            </h3>
            <p className="text-sm font-medium text-black leading-relaxed mb-8">
              Track your pregnancy week by week, receive ANC visit reminders, monitor danger signs at home, and message your Community Health Worker directly. Ndarinzwe is designed around how care actually works in Rwanda.
            </p>
            <a
              href="/signup?role=mother"
              className="inline-block px-6 py-2 border border-navy text-navy text-sm font-medium rounded-[5px] hover:bg-navy hover:text-white transition-colors"
            >
              Join as Mother
            </a>
          </div>

          {/* CHW card */}
          <div className="bg-pink-primary/10 rounded-[10px] p-8 md:p-10">
            <h3 className="text-xl font-bold text-navy mb-4">
              Better Tools For Your Maternal Care
            </h3>
            <p className="text-sm font-medium text-black leading-relaxed mb-8">
              Manage your clients, follow their pregnancy progress, send care reminders, and access verified MoH-aligned resources. Ndarinzwe gives Inshuti Mu Buzima a digital tool built for the way they work.
            </p>
            <a
              href="/signup?role=chw"
              className="inline-block px-6 py-2 border border-navy text-navy text-sm font-medium rounded-[5px] hover:bg-navy hover:text-white transition-colors"
            >
              Join as CHW
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
