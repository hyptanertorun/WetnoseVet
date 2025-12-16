'use client'

import { motion } from 'framer-motion'
import { hudDataGeneral, hudDataDigestion } from '@/data/siteData'
import { cn } from '@/lib/utils'

interface HUDProps {
  mode: 'general' | 'digestion'
  visible: boolean
  className?: string
}

export default function HUD({ mode, visible, className }: HUDProps) {
  const data = mode === 'general' ? hudDataGeneral : hudDataDigestion

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
      className={cn('hud-container', className)}
    >
      {/* HUD Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-medical-blue animate-pulse" />
          <span className="text-xs text-medical-blue uppercase tracking-wider font-medium">
            Canlı Tarama
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white">{data.title}</h3>
      </motion.div>

      {/* HUD Stats */}
      <div className="space-y-3">
        {data.stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="hud-stat"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <span className="hud-value text-lg">{stat.value}</span>
            </div>
            {/* Progress bar for visual effect */}
            <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                className="h-full bg-gradient-to-r from-medical-blue to-medical-teal rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex items-center space-x-2 text-green-400"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm">Sistem Aktif</span>
      </motion.div>
    </motion.div>
  )
}
