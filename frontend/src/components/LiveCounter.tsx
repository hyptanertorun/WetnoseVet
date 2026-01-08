'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Clock, Stethoscope } from 'lucide-react'

export default function LiveCounter() {
  const [stats, setStats] = useState({
    activePatients: 3,
    todayTreated: 12,
    waitingTime: 15,
  })

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activePatients: Math.max(1, prev.activePatients + Math.floor(Math.random() * 3) - 1),
        todayTreated: prev.todayTreated + (Math.random() > 0.7 ? 1 : 0),
        waitingTime: Math.max(5, Math.min(30, prev.waitingTime + Math.floor(Math.random() * 10) - 5)),
      }))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 border-y border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
          {/* Live Indicator */}
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <span className="text-green-400 text-sm font-medium">Canlı</span>
          </div>

          {/* Active Patients */}
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">Şu an</span>
            <motion.span
              key={stats.activePatients}
              initial={{ scale: 1.3, color: '#22d3ee' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-white font-bold"
            >
              {stats.activePatients}
            </motion.span>
            <span className="text-gray-400 text-sm">hasta tedavi altında</span>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-4 bg-white/20" />

          {/* Today Treated */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-teal-400" />
            <span className="text-gray-400 text-sm">Bugün</span>
            <motion.span
              key={stats.todayTreated}
              initial={{ scale: 1.3, color: '#14b8a6' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-white font-bold"
            >
              {stats.todayTreated}
            </motion.span>
            <span className="text-gray-400 text-sm">patili dost tedavi edildi</span>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-4 bg-white/20" />

          {/* Wait Time */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 text-sm">Ortalama bekleme</span>
            <motion.span
              key={stats.waitingTime}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-white font-bold"
            >
              ~{stats.waitingTime}
            </motion.span>
            <span className="text-gray-400 text-sm">dk</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
