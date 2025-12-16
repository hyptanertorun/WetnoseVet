'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { scrollExperienceSteps, hudDataGeneral, hudDataDigestion } from '@/data/siteData'
import { cn } from '@/lib/utils'
import { Heart, Activity, Waves, Shield, Zap, Eye } from 'lucide-react'

export default function ScrollExperience() {
  const catRef = useRef<HTMLDivElement>(null)
  const [hudMode, setHudMode] = useState<'general' | 'digestion'>('general')
  const [activeOrgan, setActiveOrgan] = useState<string | null>(null)

  const hudData = hudMode === 'general' ? hudDataGeneral : hudDataDigestion

  useEffect(() => {
    const cat = catRef.current
    if (cat) {
      gsap.to(cat, {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }
  }, [])

  const organs = [
    { id: 'heart', name: 'Kalp', icon: Heart, color: '#ef4444', position: 'top-[35%] left-[45%]' },
    { id: 'lungs', name: 'Akciğer', icon: Waves, color: '#3b82f6', position: 'top-[40%] left-[35%]' },
    { id: 'stomach', name: 'Mide', icon: Activity, color: '#22c55e', position: 'top-[55%] left-[48%]' },
  ]

  return (
    <section
      id="scroll-experience"
      className="relative bg-gradient-to-b from-gray-900 via-[#0a1628] to-gray-900 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-medical-blue/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-medical-blue/10 border border-medical-blue/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-medical-blue" />
            <span className="text-sm font-medium text-medical-blue">Gelişmiş Teknoloji</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            Holografik <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue to-teal-400">Sağlık Taraması</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Modern teknolojimiz ile dostunuzun sağlık durumunu gerçek zamanlı analiz ediyoruz
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - 3D Cat Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Holographic Ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[400px] rounded-full border border-medical-blue/30 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute w-[350px] h-[350px] rounded-full border border-teal-500/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              <div className="absolute w-[300px] h-[300px] rounded-full border border-medical-blue/40" />
            </div>

            {/* Cat Container */}
            <div ref={catRef} className="relative w-full aspect-square max-w-md mx-auto">
              {/* Premium 3D Cat SVG */}
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <linearGradient id="catBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="softGlow">
                    <feGaussianBlur stdDeviation="8" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Body */}
                <ellipse cx="200" cy="260" rx="90" ry="70" fill="url(#catBodyGradient)" filter="url(#softGlow)" />
                
                {/* Head */}
                <circle cx="200" cy="150" r="70" fill="url(#catBodyGradient)" filter="url(#softGlow)" />
                
                {/* Ears */}
                <path d="M135 100 L155 145 L115 125 Z" fill="url(#catBodyGradient)" />
                <path d="M265 100 L245 145 L285 125 Z" fill="url(#catBodyGradient)" />
                <path d="M140 105 L155 135 L125 120 Z" fill="#475569" />
                <path d="M260 105 L245 135 L275 120 Z" fill="#475569" />
                
                {/* Eyes - Glowing */}
                <ellipse cx="170" cy="140" rx="15" ry="18" fill="#00d4ff" filter="url(#glow)" className="animate-pulse" />
                <ellipse cx="230" cy="140" rx="15" ry="18" fill="#00d4ff" filter="url(#glow)" className="animate-pulse" />
                <ellipse cx="170" cy="140" rx="7" ry="10" fill="#0f172a" />
                <ellipse cx="230" cy="140" rx="7" ry="10" fill="#0f172a" />
                <circle cx="173" cy="136" r="3" fill="white" />
                <circle cx="233" cy="136" r="3" fill="white" />
                
                {/* Nose */}
                <path d="M200 165 L193 178 L207 178 Z" fill="#f472b6" />
                
                {/* Mouth */}
                <path d="M200 178 Q188 192 180 185" stroke="#64748b" strokeWidth="2" fill="none" />
                <path d="M200 178 Q212 192 220 185" stroke="#64748b" strokeWidth="2" fill="none" />
                
                {/* Whiskers */}
                <g stroke="#94a3b8" strokeWidth="1.5" opacity="0.7">
                  <line x1="160" y1="170" x2="110" y2="160" />
                  <line x1="160" y1="178" x2="110" y2="178" />
                  <line x1="160" y1="186" x2="110" y2="196" />
                  <line x1="240" y1="170" x2="290" y2="160" />
                  <line x1="240" y1="178" x2="290" y2="178" />
                  <line x1="240" y1="186" x2="290" y2="196" />
                </g>
                
                {/* Paws */}
                <ellipse cx="140" cy="320" rx="25" ry="18" fill="url(#catBodyGradient)" />
                <ellipse cx="260" cy="320" rx="25" ry="18" fill="url(#catBodyGradient)" />
                
                {/* Tail */}
                <path 
                  d="M290 260 Q340 250 330 200 Q320 160 350 140" 
                  stroke="url(#catBodyGradient)" 
                  strokeWidth="20" 
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Holographic Scan Lines */}
                <g opacity="0.6">
                  <line x1="100" y1="120" x2="300" y2="120" stroke="url(#glowGradient)" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" />
                  <line x1="100" y1="180" x2="300" y2="180" stroke="url(#glowGradient)" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <line x1="100" y1="240" x2="300" y2="240" stroke="url(#glowGradient)" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <line x1="100" y1="300" x2="300" y2="300" stroke="url(#glowGradient)" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
                </g>

                {/* Organ Points */}
                {organs.map((organ) => (
                  <g key={organ.id} className="cursor-pointer" onClick={() => setActiveOrgan(activeOrgan === organ.id ? null : organ.id)}>
                    <circle 
                      cx={organ.id === 'heart' ? 200 : organ.id === 'lungs' ? 160 : 200} 
                      cy={organ.id === 'heart' ? 220 : organ.id === 'lungs' ? 230 : 270} 
                      r={activeOrgan === organ.id ? 12 : 8} 
                      fill={organ.color} 
                      filter="url(#glow)"
                      className="transition-all duration-300"
                    />
                    {activeOrgan === organ.id && (
                      <circle 
                        cx={organ.id === 'heart' ? 200 : organ.id === 'lungs' ? 160 : 200} 
                        cy={organ.id === 'heart' ? 220 : organ.id === 'lungs' ? 230 : 270} 
                        r="20" 
                        fill="none"
                        stroke={organ.color}
                        strokeWidth="2"
                        className="animate-ping"
                      />
                    )}
                  </g>
                ))}
              </svg>

              {/* Floating Labels */}
              {organs.map((organ, index) => (
                <motion.div
                  key={organ.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: activeOrgan === organ.id ? 1 : 0.6, scale: activeOrgan === organ.id ? 1.1 : 1 }}
                  className={cn(
                    'absolute px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-all',
                    activeOrgan === organ.id ? 'bg-white/20 backdrop-blur-md' : 'bg-white/10 backdrop-blur-sm',
                    organ.position
                  )}
                  onClick={() => setActiveOrgan(activeOrgan === organ.id ? null : organ.id)}
                >
                  <organ.icon className="w-3 h-3" style={{ color: organ.color }} />
                  <span className="text-white">{organ.name}</span>
                </motion.div>
              ))}
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center mt-8 space-x-3">
              <button
                onClick={() => setHudMode('general')}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                  hudMode === 'general'
                    ? 'bg-medical-blue text-white shadow-lg shadow-medical-blue/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                )}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Genel Tarama
              </button>
              <button
                onClick={() => setHudMode('digestion')}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                  hudMode === 'digestion'
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                )}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Sindirim Analizi
              </button>
            </div>
          </motion.div>

          {/* Right - HUD Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* HUD Title */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Canlı Tarama Aktif</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{hudData.title}</h3>
              <p className="text-gray-400 text-sm">Gerçek zamanlı sağlık verisi analizi</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {hudData.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-medical-blue/50 transition-all group"
                >
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white group-hover:text-medical-blue transition-colors">
                    {stat.value}
                  </p>
                  <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-medical-blue to-teal-400 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature List */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h4 className="text-white font-semibold mb-4">Tarama Özellikleri</h4>
              <div className="space-y-3">
                {scrollExperienceSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-medical-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-medical-blue" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{step.title}</p>
                      <p className="text-gray-500 text-xs">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
