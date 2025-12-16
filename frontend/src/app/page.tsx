import Header from '@/components/Header'
import HeroSlider from '@/components/HeroSlider'
import ScrollExperience from '@/components/ScrollExperience'
import ServicesCarousel from '@/components/ServicesCarousel'
import Team from '@/components/Team'
import Gallery from '@/components/Gallery'
import ContactForm from '@/components/ContactForm'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSlider />
      <ScrollExperience />
      <ServicesCarousel />
      <Team />
      <Gallery />
      <ContactForm />
      <Footer />
    </main>
  )
}
