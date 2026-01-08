'use client'

import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import HeroSlider from '@/components/HeroSlider'
import ClinicRhythm from '@/components/ClinicRhythm'
import LiveCounter from '@/components/LiveCounter'
import ScrollExperience from '@/components/ScrollExperience'
import ServicesCarousel from '@/components/ServicesCarousel'
import Certifications from '@/components/Certifications'
import Team from '@/components/Team'
import EmergencySection from '@/components/EmergencySection'
import Gallery from '@/components/Gallery'
import HealthTips from '@/components/HealthTips'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'
import WhatsappButton from '@/components/WhatsappButton'

// Dynamic import to prevent prerender issues
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })

export default function Home() {
  return (
    <>
      {/* EMERGENT-RUNTIME-TEST-2026-01-08-PETCLINIC9 */}
      <main className="min-h-screen relative">
        <Header />
        <HeroSlider />
        <ClinicRhythm />
        <LiveCounter />
        <ScrollExperience />
        <ServicesCarousel />
        <Certifications />
        <Team />
        <EmergencySection />
        <Gallery />
        <Testimonials />
        <HealthTips />
        <ContactForm />
        <Footer />
        <WhatsappButton />
      </main>
    </>
  )
}
