'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPublicServices, Service } from '@/lib/publicApi'
import { ArrowRight, Stethoscope, FlaskConical, Scan, Ambulance, Droplets, HeartPulse, Scissors, Sparkles, Loader2 } from 'lucide-react'
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

export default function HizmetlerPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadServices() {
      const data = await getPublicServices()
      setServices(data)
      setLoading(false)
    }
    loadServices()
  }, [])

  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />
      
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[180px]"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-6"
            >
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-300">Profesyonel Hizmetler</span>
            </motion.div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Hizmetlerimiz
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Dostlarınız için en kapsamlı veteriner hizmetleri
            </p>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <Stethoscope className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Henüz hizmet eklenmemiş</p>
            </div>
          ) : (
            /* Services Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Link 
                    href={`/hizmetler/${service.slug}`}
                    className="block group relative h-full bg-teal-500/10 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 hover:border-teal-400/50 hover:-translate-y-2 hover:scale-[1.02] transition-all cursor-pointer"
                    style={{
                      boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {(() => {
                        const IconComponent = service.icon ? iconMap[service.icon] : null
                        return IconComponent ? <IconComponent className="w-7 h-7 text-teal-400" /> : <Stethoscope className="w-7 h-7 text-teal-400" />
                      })()}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {service.short_description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-teal-400 text-sm font-medium">
                      Detaylı Bilgi
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
