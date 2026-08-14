import UtilityBar from '@/components/UtilityBar'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import CareJourney from '@/components/CareJourney'
import YourCare from '@/components/YourCare'
import PrivacySection from '@/components/PrivacySection'
import HowItWorks from '@/components/HowItWorks'
import FAQ from '@/components/FAQ'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <UtilityBar />
      <Navbar />
      <Hero />
      <CareJourney />
      <YourCare />
      <PrivacySection />
      <HowItWorks />
      <FAQ />
      <Newsletter />
      <Footer />
    </main>
  )
}
