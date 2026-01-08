'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { hudDataGeneral, hudDataDigestion, scrollExperienceSteps } from '@/data/siteData'
import TextReveal from './TextReveal'
import MagneticButton from './MagneticButton'
import { cn } from '@/lib/utils'
import { Heart, Activity, Waves, Shield, Zap, Eye, Cpu, Scan, Cat, Dog } from 'lucide-react'

// AI-Generated hologram görselleri
const animalImages = {
  cat: '/hologram-cat.png',
  dog: '/hologram-dog.png',
}

// Organ pozisyonları (yüzde cinsinden - görsele göre ayarlanacak)
const organPositions = {
  cat: {
    heart: { x: 42, y: 48 },
    lungs: { x: 58, y: 42 },
    stomach: { x: 45, y: 62 },
  },
  dog: {
    heart: { x: 40, y: 50 },
    lungs: { x: 60, y: 44 },
    stomach: { x: 42, y: 65 },
  },
}

export default function ScrollExperience() {
  const [hudMode, setHudMode] = useState<'general' | 'digestion'>('general')
  const [activeOrgan, setActiveOrgan] = useState<string | null>('heart')
  const [scanProgress, setScanProgress] = useState(0)
  const [selectedAnimal, setSelectedAnimal] = useState<'cat' | 'dog'>('cat')
  const [glitchEffect, setGlitchEffect] = useState(false)

  const hudData = hudMode === 'general' ? hudDataGeneral : hudDataDigestion

  // Scan animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 40)
    return () => clearInterval(interval)
  }, [])

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true)
      setTimeout(() => setGlitchEffect(false), 150)
    }, 4000)
    return () => clearInterval(glitchInterval)
  }, [])

  const organs = [
    { id: 'heart', name: 'Kalp', icon: Heart, color: '#ef4444', value: '72 BPM', description: 'Normal ritim' },
    { id: 'lungs', name: 'Akciğer', icon: Waves, color: '#3b82f6', value: '%99 O₂', description: 'Mükemmel' },
    { id: 'stomach', name: 'Sindirim', icon: Activity, color: '#22c55e', value: 'Aktif', description: 'Sağlıklı' },
  ]

  const currentPositions = organPositions[selectedAnimal]

  const handleAnimalChange = (animal: 'cat' | 'dog') => {
    if (animal !== selectedAnimal) {
      setGlitchEffect(true)
      setTimeout(() => {
        setSelectedAnimal(animal)
        setGlitchEffect(false)
      }, 200)
    }
  }

  return (
    <section
      id="scroll-experience"
      className="relative min-h-screen bg-[#030712] overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Horizontal Scan Line */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          style={{ top: `${scanProgress}%` }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/50 rounded-full px-5 py-2.5 mb-6 shadow-lg shadow-cyan-500/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
            </motion.div>
            <span className="text-sm font-semibold text-cyan-300">AI Destekli Tarama</span>
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            <TextReveal delay={0.2}>Holografik</TextReveal>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
              <TextReveal delay={0.4}>Sağlık Taraması</TextReveal>
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Yapay zeka destekli sistemimiz ile dostunuzun sağlık durumunu saniyeler içinde analiz ediyoruz
          </motion.p>
        </motion.div>

        {/* Animal Selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
            <motion.button
              onClick={() => handleAnimalChange('cat')}
              onMouseEnter={() => handleAnimalChange('cat')}
              className={cn(
                'flex items-center space-x-2 px-8 py-3.5 rounded-xl transition-all duration-300 font-medium',
                selectedAnimal === 'cat'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Cat className="w-5 h-5" />
              <span>Kedi</span>
            </motion.button>
            <motion.button
              onClick={() => handleAnimalChange('dog')}
              onMouseEnter={() => handleAnimalChange('dog')}
              className={cn(
                'flex items-center space-x-2 px-8 py-3.5 rounded-xl transition-all duration-300 font-medium',
                selectedAnimal === 'dog'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Dog className="w-5 h-5" />
              <span>Köpek</span>
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left - Holographic Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 relative"
          >
            {/* Holographic Container */}
            <div className="relative aspect-square max-w-xl mx-auto">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-transparent to-teal-500/20 blur-3xl" />
              
              {/* Rotating Tech Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[105%] h-[105%] rounded-full"
                  style={{
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderStyle: 'dashed',
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-[98%] h-[98%] rounded-full border border-teal-400/20"
                />
              </div>

              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-400/60 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-cyan-400/60 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-cyan-400/60 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-400/60 rounded-br-lg" />

              {/* Holographic Animal Image */}
              <div className="absolute inset-[8%] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedAnimal}
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      filter: glitchEffect ? 'blur(2px) hue-rotate(20deg)' : 'blur(0px)' 
                    }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                  >
                    {/* Main Hologram Image */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <motion.img
                        src={animalImages[selectedAnimal]}
                        alt={selectedAnimal === 'cat' ? 'Holografik Kedi' : 'Holografik Köpek'}
                        className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,212,255,0.5)]"
                        animate={{
                          filter: glitchEffect 
                            ? 'brightness(1.3) contrast(1.1) hue-rotate(10deg)' 
                            : 'brightness(1) contrast(1) hue-rotate(0deg)'
                        }}
                      />
                      
                      {/* Scan Line Effect */}
                      <motion.div
                        className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' }}
                      />

                      {/* Glitch Overlay */}
                      {glitchEffect && (
                        <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
                      )}
                    </div>

                    {/* Floating Data Points */}
                    {organs.map((organ) => {
                      const pos = currentPositions[organ.id as keyof typeof currentPositions]
                      return (
                        <motion.div
                          key={organ.id}
                          className="absolute cursor-pointer z-10"
                          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                          onClick={() => setActiveOrgan(organ.id)}
                          whileHover={{ scale: 1.4 }}
                        >
                          {/* Pulse Rings */}
                          <motion.div
                            className="absolute -inset-3 rounded-full"
                            style={{ backgroundColor: organ.color }}
                            animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute -inset-2 rounded-full"
                            style={{ backgroundColor: organ.color }}
                            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                          />
                          
                          {/* Core Point */}
                          <div
                            className={cn(
                              'relative w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300',
                              activeOrgan === organ.id ? 'scale-150' : ''
                            )}
                            style={{ 
                              backgroundColor: organ.color,
                              boxShadow: `0 0 15px ${organ.color}, 0 0 30px ${organ.color}50`
                            }}
                          />
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Status Indicators */}
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span className="text-xs text-green-400 font-mono">LIVE SCAN</span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs text-cyan-400/70 font-mono">{scanProgress}%</span>
              </div>

              {/* Floating Organ Labels */}
              {organs.map((organ, index) => {
                const positions = [
                  'top-[20%] -left-4 lg:-left-8',
                  'top-[50%] -right-4 lg:-right-8',
                  'bottom-[15%] -left-4 lg:-left-8',
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
                      'absolute cursor-pointer transition-all duration-300 z-20',
                      positions[index],
                      activeOrgan === organ.id ? 'scale-105' : 'opacity-60 hover:opacity-100'
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-3 rounded-xl backdrop-blur-xl border transition-all',
                        activeOrgan === organ.id
                          ? 'bg-black/60 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                          : 'bg-black/40 border-white/10'
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${organ.color}30` }}
                      >
                        <organ.icon className="w-5 h-5" style={{ color: organ.color }} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{organ.name}</p>
                        <p className="text-xs font-mono" style={{ color: organ.color }}>{organ.value}</p>
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
            initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Status Card */}
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 p-6"
              whileHover={{ borderColor: 'rgba(0, 212, 255, 0.4)' }}
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)',
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
                  <Scan className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{hudData.title}</h3>
                <p className="text-gray-400 text-sm">Gerçek zamanlı sağlık analizi</p>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-5">
              {hudData.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(0, 212, 255, 0.5)' }}
                  className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4 group"
                >
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {stat.value}
                  </p>
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
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
              className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-5"
            >
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 text-cyan-400 mr-2" />
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
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-cyan-400" />
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
