'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Phone, Ambulance, Clock, Zap } from 'lucide-react'

const emergencySymptoms = [
  'Zehirlenme şüphesi',
  'Trafik kazası',
  'Nöbet geçirme',
  'Ağır kanama',
  'Nefes alamama',
  'Bilinç kaybı',
]

// Format phone number for display
function formatPhoneNumber(phone: string): string {
  if (!phone) return '0553 484 54 24'
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  // Format: 0XXX XXX XX XX
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`
  }
  if (digits.length === 10) {
    return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
  }
  return phone
}

// Format phone number for tel: link
function formatPhoneForTel(phone: string): string {
  if (!phone) return '+905534845424'
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    return `+9${digits}`
  }
  if (digits.startsWith('90')) {
    return `+${digits}`
  }
  return `+90${digits}`
}

export default function EmergencySection() {
  const [emergencyPhone, setEmergencyPhone] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function fetchSettings() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/public/settings`)
        if (res.ok) {
          const data = await res.json()
          setEmergencyPhone(data.emergency_phone || '0553 484 54 24')
        } else {
          setEmergencyPhone('0553 484 54 24')
        }
      } catch (err) {
        console.error('Failed to fetch emergency phone:', err)
        setEmergencyPhone('0553 484 54 24')
      }
    }
    fetchSettings()
  }, [])

  // Hydration için aynı değeri server ve client'ta göster
  const displayPhone = mounted && emergencyPhone ? formatPhoneNumber(emergencyPhone) : '0553 484 54 24'
  const telPhone = mounted && emergencyPhone ? formatPhoneForTel(emergencyPhone) : '+905534845424'

  return (
    <section className="py-16 bg-gradient-to-r from-red-950/50 via-orange-950/30 to-red-950/50 relative overflow-hidden">
      {/* Warning Stripes Background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,100,0,0.5) 10px, rgba(255,100,0,0.5) 20px)',
          }}
        />
      </div>

      {/* Animated Glow */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.1) 0%, transparent 70%)'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left - Icon & Title */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30 mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Acil Durumlar İçin
            </h2>
            <p className="text-gray-400 max-w-md">
              7/24 acil veteriner hizmeti. Aşağıdaki belirtilerde hemen arayın!
            </p>
          </motion.div>

          {/* Center - Symptoms */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {emergencySymptoms.map((symptom, index) => (
                <motion.div
                  key={symptom}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                >
                  <Zap className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-white text-sm">{symptom}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - CTA */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-right"
          >
            <div className="flex items-center justify-center lg:justify-end space-x-2 text-gray-400 text-sm mb-3">
              <Clock className="w-4 h-4" />
              <span>7/24 Acil Hizmet</span>
            </div>

            <motion.a
              href={`tel:${telPhone}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-red-500/30 transition-all"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                <Phone className="w-6 h-6" />
              </motion.div>
              <div className="text-left">
                <span className="block text-xs opacity-80">Acil Hat</span>
                <span className="block text-xl">{displayPhone}</span>
              </div>
            </motion.a>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center lg:justify-end space-x-2 mt-4 text-orange-400"
            >
              <Ambulance className="w-5 h-5" />
              <span className="text-sm font-medium">Evde Acil Müdahale Mümkün</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
