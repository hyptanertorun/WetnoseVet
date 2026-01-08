'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Service } from '@/lib/publicApi'
import { ArrowLeft, Clock, CheckCircle, Calendar, Phone, FlaskConical, Scan, Ambulance, Droplets, Stethoscope, HeartPulse, Scissors, Sparkles } from 'lucide-react'
import Link from 'next/link'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flask: FlaskConical,
  scan: Scan,
  ambulance: Ambulance,
  droplet: Droplets,
  stethoscope: Stethoscope,
  'heart-pulse': HeartPulse,
  scissors: Scissors,
  sparkles: Sparkles,
}

interface HizmetDetailClientProps {
  service: Service
}

export default function HizmetDetailClient({ service }: HizmetDetailClientProps) {
  const IconComponent = service.icon ? iconMap[service.icon.toLowerCase()] : Stethoscope

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24">
        <div className="container mx-auto px-4 py-16">
          {/* Back Button */}
          <Link 
            href="/hizmetler"
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Tüm Hizmetler
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  {IconComponent && (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-teal-400" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{service.title}</h1>
                    <p className="text-gray-400">{service.short_description}</p>
                  </div>
                </div>

                {/* Image */}
                {service.cover_image_url && (
                  <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
                    <img
                      src={service.cover_image_url}
                      alt={service.cover_image_alt || service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div 
                  className="prose prose-invert prose-teal max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.long_description || service.short_description || '' }}
                />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 sticky top-24"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Randevu Alın</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <span>Pazartesi - Cumartesi: 09:00 - 20:00</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-5 h-5 text-teal-400" />
                    <a href="tel:+905534845424" className="hover:text-teal-400 transition-colors">
                      +90 553 484 54 24
                    </a>
                  </div>
                </div>

                <a
                  href="https://wa.me/905534845424"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  WhatsApp ile Randevu
                </a>

                {/* Features */}
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Neden Bizi Seçmelisiniz?</h4>
                  <ul className="space-y-3">
                    {['Uzman veteriner kadrosu', 'Modern ekipmanlar', '7/24 acil destek', 'Uygun fiyat politikası'].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
