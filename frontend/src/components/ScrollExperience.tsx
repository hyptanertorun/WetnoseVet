'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { hudDataGeneral, hudDataDigestion, scrollExperienceSteps } from '@/data/siteData'
import TextReveal from './TextReveal'
import MagneticButton from './MagneticButton'
import { cn } from '@/lib/utils'
import { Heart, Activity, Waves, Shield, Zap, Eye, Cpu, Scan } from 'lucide-react'

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hudMode, setHudMode] = useState<'general' | 'digestion'>('general')
  const [activeOrgan, setActiveOrgan] = useState<string | null>('heart')
  const [scanProgress, setScanProgress] = useState(0)

  const hudData = hudMode === 'general' ? hudDataGeneral : hudDataDigestion

  // Scan animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const organs = [
    { id: 'heart', name: 'Kalp', icon: Heart, color: '#ef4444', value: '72 BPM', description: 'Normal ritim' },
    { id: 'lungs', name: 'Akciğer', icon: Waves, color: '#3b82f6', value: '%99 O₂', description: 'Mükemmel' },
    { id: 'stomach', name: 'Sindirim', icon: Activity, color: '#22c55e', value: 'Aktif', description: 'Sağlıklı' },
  ]

  return (
    <section
      id="scroll-experience"
      ref={containerRef}
      className="relative min-h-screen bg-[#030712] overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-medical-blue/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[200px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Scan Line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-medical-blue to-transparent opacity-50"
          style={{ top: `${scanProgress}%` }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-medical-blue/10 border border-medical-blue/30 rounded-full px-5 py-2.5 mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Cpu className="w-4 h-4 text-medical-blue" />
            </motion.div>
            <span className="text-sm font-medium text-medical-blue">AI Destekli Tarama</span>
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <TextReveal delay={0.2}>Holografik</TextReveal>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue via-teal-400 to-cyan-300">
              <TextReveal delay={0.4}>Sağlık Taraması</TextReveal>
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Yapay zeka destekli sistemimiz ile dostunuzun sağlık durumunu saniyeler içinde analiz ediyoruz
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left - 3D Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 relative"
          >
            {/* Holographic Container */}
            <div className="relative aspect-square max-w-2xl mx-auto">
              {/* Rotating Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-full h-full rounded-full border border-medical-blue/20"
                  style={{ borderStyle: 'dashed' }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[85%] h-[85%] rounded-full border border-teal-500/20"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[70%] h-[70%] rounded-full border border-cyan-400/30"
                />
              </div>

              {/* Central Glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-64 h-64 rounded-full bg-medical-blue/20 blur-3xl"
                />
              </div>

              {/* 3D Cat Hologram */}
              <div className="relative w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 400 400" className="w-[80%] h-[80%]">
                  <defs>
                    <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="holoGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="scanLine">
                      <feGaussianBlur stdDeviation="2" />
                    </filter>
                  </defs>

                  {/* Holographic Cat - Wireframe Style */}
                  <g filter="url(#holoGlow)" className="animate-pulse" style={{ animationDuration: '3s' }}>
                    {/* Body outline */}
                    <ellipse cx="200" cy="250" rx="80" ry="60" fill="none" stroke="url(#holoGradient)" strokeWidth="1.5" />
                    <ellipse cx="200" cy="250" rx="70" ry="50" fill="none" stroke="url(#holoGradient)" strokeWidth="0.5" opacity="0.5" />
                    
                    {/* Head */}
                    <circle cx="200" cy="140" r="60" fill="none" stroke="url(#holoGradient)" strokeWidth="1.5" />
                    <circle cx="200" cy="140" r="50" fill="none" stroke="url(#holoGradient)" strokeWidth="0.5" opacity="0.5" />
                    
                    {/* Ears */}
                    <path d="M145 95 L165 130 L125 115 Z" fill="none" stroke="url(#holoGradient)" strokeWidth="1.5" />
                    <path d="M255 95 L235 130 L275 115 Z" fill="none" stroke="url(#holoGradient)" strokeWidth="1.5" />
                    
                    {/* Eyes - Glowing */}
                    <circle cx="175" cy="135" r="12" fill="#00d4ff" opacity="0.8">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="225" cy="135" r="12" fill="#00d4ff" opacity="0.8">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="175" cy="135" r="5" fill="#030712" />
                    <circle cx="225" cy="135" r="5" fill="#030712" />
                    
                    {/* Nose */}
                    <path d="M200 155 L195 165 L205 165 Z" fill="#14b8a6" opacity="0.8" />
                    
                    {/* Whiskers */}
                    <g stroke="url(#holoGradient)" strokeWidth="0.8" opacity="0.6">
                      <line x1="165" y1="160" x2="120" y2="155" />
                      <line x1="165" y1="165" x2="120" y2="165" />
                      <line x1="165" y1="170" x2="120" y2="175" />
                      <line x1="235" y1="160" x2="280" y2="155" />
                      <line x1="235" y1="165" x2="280" y2="165" />
                      <line x1="235" y1="170" x2="280" y2="175" />
                    </g>
                    
                    {/* Tail */}
                    <path d="M280 250 Q320 240 310 200 Q300 170 330 150" fill="none" stroke="url(#holoGradient)" strokeWidth="1.5" strokeLinecap="round" />
                    
                    {/* Paws */}
                    <ellipse cx="150" cy="305" rx="20" ry="12" fill="none" stroke="url(#holoGradient)" strokeWidth="1.5" />
                    <ellipse cx="250" cy="305" rx="20" ry="12" fill="none" stroke="url(#holoGradient)" strokeWidth="1.5" />
                  </g>

                  {/* Organ Hotspots */}
                  {organs.map((organ, i) => {
                    const positions = { heart: { x: 200, y: 220 }, lungs: { x: 160, y: 230 }, stomach: { x: 200, y: 265 } }
                    const pos = positions[organ.id as keyof typeof positions]
                    return (
                      <g key={organ.id}>
                        <motion.circle
                          cx={pos.x}
                          cy={pos.y}
                          r={activeOrgan === organ.id ? 15 : 10}
                          fill={organ.color}
                          opacity={activeOrgan === organ.id ? 0.9 : 0.6}
                          className="cursor-pointer"
                          whileHover={{ scale: 1.3 }}
                          onClick={() => setActiveOrgan(organ.id)}
                          filter="url(#holoGlow)"
                        />
                        {activeOrgan === organ.id && (
                          <motion.circle
                            cx={pos.x}
                            cy={pos.y}
                            r="25"
                            fill="none"
                            stroke={organ.color}
                            strokeWidth="2"
                            initial={{ scale: 0.5, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </g>
                    )
                  })}

                  {/* Scan Lines */}
                  <g opacity="0.3">
                    {[...Array(8)].map((_, i) => (
                      <line
                        key={i}
                        x1="50"
                        y1={80 + i * 40}
                        x2="350"
                        y2={80 + i * 40}
                        stroke="url(#holoGradient)"
                        strokeWidth="0.5"
                        strokeDasharray="10,10"
                      >
                        <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite" />
                      </line>
                    ))}
                  </g>
                </svg>
              </div>

              {/* Floating Organ Labels */}
              {organs.map((organ, index) => {
                const positions = [
                  'top-[30%] -left-4 lg:left-0',
                  'top-[45%] -right-4 lg:right-0',
                  'bottom-[25%] -left-4 lg:left-0',
                ]
                return (
                  <motion.div
                    key={organ.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                    onClick={() => setActiveOrgan(organ.id)}
                    className={cn(
                      'absolute cursor-pointer transition-all duration-300',
                      positions[index],
                      activeOrgan === organ.id ? 'scale-110' : 'opacity-70 hover:opacity-100'
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-3 rounded-xl backdrop-blur-xl border transition-all',
                        activeOrgan === organ.id
                          ? 'bg-white/10 border-white/30 shadow-lg'
                          : 'bg-white/5 border-white/10'
                      )}
                      style={{
                        boxShadow: activeOrgan === organ.id ? `0 0 30px ${organ.color}30` : 'none'
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${organ.color}20` }}
                      >
                        <organ.icon className="w-5 h-5" style={{ color: organ.color }} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{organ.name}</p>
                        <p className="text-xs" style={{ color: organ.color }}>{organ.value}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center mt-8 space-x-4">
              {[
                { mode: 'general', icon: Eye, label: 'Genel Tarama' },
                { mode: 'digestion', icon: Activity, label: 'Sindirim Analizi' },
              ].map((item) => (
                <MagneticButton
                  key={item.mode}
                  onClick={() => setHudMode(item.mode as 'general' | 'digestion')}
                  variant={hudMode === item.mode ? 'primary' : 'secondary'}
                  className="!px-5 !py-3"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </MagneticButton>
              ))}
            </div>
          </motion.div>

          {/* Right - HUD Panel */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Status Card */}
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-6"
              whileHover={{ borderColor: 'rgba(0, 212, 255, 0.3)' }}
            >
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)',
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-green-500"
                    />
                    <span className="text-green-400 text-sm font-medium">Canlı Tarama Aktif</span>
                  </div>
                  <Scan className="w-5 h-5 text-medical-blue animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{hudData.title}</h3>
                <p className="text-gray-400 text-sm">Gerçek zamanlı sağlık analizi</p>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {hudData.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(0, 212, 255, 0.5)' }}
                  className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 group"
                >
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white group-hover:text-medical-blue transition-colors">
                    {stat.value}
                  </p>
                  <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-medical-blue to-teal-400 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
            >
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 text-medical-blue mr-2" />
                Tarama Kapsamı
              </h4>
              <div className="space-y-3">
                {scrollExperienceSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-medical-blue/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-medical-blue" />
                    </div>
                    <span className="text-gray-300">{step.title}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
