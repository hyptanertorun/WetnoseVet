'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, Mail, Clock, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface MaintenanceData {
  maintenance_mode: boolean
  maintenance_message: string | null
  maintenance_end_date: string | null
  phone: string
  whatsapp: string
  email: string
}

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceData | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/maintenance-status`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (error) {
        console.error('Failed to fetch maintenance status:', error)
      }
    }
    fetchStatus()
  }, [])

  useEffect(() => {
    if (!data?.maintenance_end_date) return

    const calculateTimeLeft = () => {
      const endDate = new Date(data.maintenance_end_date!)
      const now = new Date()
      const diff = endDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Çok yakında!')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days} gün ${hours} saat`)
      } else if (hours > 0) {
        setTimeLeft(`${hours} saat ${minutes} dakika`)
      } else {
        setTimeLeft(`${minutes} dakika`)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000)
    return () => clearInterval(interval)
  }, [data?.maintenance_end_date])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Image
            src="/images/brand/logo.png"
            alt="WETNOSE Veteriner Kliniği"
            width={280}
            height={100}
            priority
            className="brightness-0 invert drop-shadow-2xl"
          />
        </motion.div>

        {/* Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-2xl w-full"
        >
          {/* Card Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl" />
          
          {/* Card */}
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Animated Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>

            {/* Title */}
            <div className="text-center mt-4 mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Sitemiz Güncelleniyor
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"
              />
            </div>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center text-white/70 text-lg mb-8 leading-relaxed"
            >
              {data?.maintenance_message || 'Sitemiz şu anda güncelleniyor. Çok yakında daha iyi bir deneyimle karşınızda olacağız!'}
            </motion.p>

            {/* Countdown (if end date exists) */}
            {timeLeft && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-3 mb-8 p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <Clock className="w-5 h-5 text-teal-400" />
                <span className="text-white/60">Tahmini açılış:</span>
                <span className="text-xl font-semibold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {timeLeft}
                </span>
              </motion.div>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-white/40 bg-gray-900/50 rounded-full">
                  Acil Durumlar İçin
                </span>
              </div>
            </div>

            {/* Contact Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Phone */}
              <a
                href={`tel:${(data?.phone || '0553 484 54 24').replace(/\s/g, '')}`}
                className="group flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-white/60 text-sm mb-1">Telefon</span>
                <span className="text-white font-medium text-sm">
                  {data?.phone || '0553 484 54 24'}
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${data?.whatsapp || '905534845424'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-white/60 text-sm mb-1">WhatsApp</span>
                <span className="text-white font-medium text-sm">Mesaj Gönder</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:${data?.email || 'info@wetnose.com.tr'}`}
                className="group flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-white/60 text-sm mb-1">E-posta</span>
                <span className="text-white font-medium text-sm">
                  {data?.email || 'info@wetnose.com.tr'}
                </span>
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-white/30 text-sm"
        >
          © {new Date().getFullYear()} WETNOSE Veteriner Kliniği
        </motion.p>
      </div>
    </div>
  )
}
