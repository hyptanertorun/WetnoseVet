'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollExperienceSteps } from '@/data/siteData'
import OrganOverlay from './OrganOverlay'
import HUD from './HUD'
import { cn } from '@/lib/utils'

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hudMode, setHudMode] = useState<'general' | 'digestion'>('general')
  const [showOrganOverlay, setShowOrganOverlay] = useState(false)
  const [is3DEnabled, setIs3DEnabled] = useState(true)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIs3DEnabled(false)
      return
    }

    // Simple breathing animation for cat
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

    // Show organ overlay by default
    setShowOrganOverlay(true)
    setCurrentStep(3) // Show all steps as complete
  }, [])

  return (
    <section
      id="scroll-experience"
      ref={containerRef}
      className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Single screen content - no pinning needed */}
      <div className="min-h-screen py-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black" />
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-medical-blue/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Main Content Grid */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - 3D Model / Cat */}
            <div className="relative order-2 lg:order-1">
              {/* 3D Toggle */}
              <button
                onClick={() => setIs3DEnabled(!is3DEnabled)}
                className="absolute top-4 left-4 z-20 glass-dark px-3 py-1.5 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
              >
                {is3DEnabled ? '3D: Açık' : '3D: Kapalı'}
              </button>

              {/* Mode Toggle */}
              <div className="absolute top-4 right-4 z-20 flex space-x-2">
                <button
                  onClick={() => setHudMode('general')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs transition-colors',
                    hudMode === 'general'
                      ? 'bg-medical-blue text-white'
                      : 'glass-dark text-gray-300 hover:text-white'
                  )}
                >
                  Genel
                </button>
                <button
                  onClick={() => setHudMode('digestion')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs transition-colors',
                    hudMode === 'digestion'
                      ? 'bg-medical-blue text-white'
                      : 'glass-dark text-gray-300 hover:text-white'
                  )}
                >
                  Sindirim
                </button>
              </div>

              {/* Cat Container */}
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-medical-blue/20 blur-xl animate-pulse" />
                
                {/* Cat Model Area */}
                <div
                  ref={catRef}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {is3DEnabled ? (
                    // 3D Cat representation (Spline or SVG placeholder)
                    <div className="relative w-4/5 h-4/5">
                      {/* Stylized Cat SVG */}
                      <svg
                        viewBox="0 0 200 200"
                        className="w-full h-full"
                        fill="none"
                      >
                        {/* Cat silhouette - friendly stylized */}
                        <defs>
                          <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#374151" />
                            <stop offset="100%" stopColor="#1f2937" />
                          </linearGradient>
                          <filter id="catGlow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Body */}
                        <ellipse cx="100" cy="130" rx="55" ry="45" fill="url(#catGradient)" filter="url(#catGlow)" />
                        
                        {/* Head */}
                        <circle cx="100" cy="70" r="40" fill="url(#catGradient)" filter="url(#catGlow)" />
                        
                        {/* Ears */}
                        <path d="M65 45 L75 70 L55 60 Z" fill="url(#catGradient)" />
                        <path d="M135 45 L125 70 L145 60 Z" fill="url(#catGradient)" />
                        
                        {/* Inner ears */}
                        <path d="M68 50 L75 65 L60 58 Z" fill="#4b5563" />
                        <path d="M132 50 L125 65 L140 58 Z" fill="#4b5563" />
                        
                        {/* Eyes */}
                        <ellipse cx="85" cy="65" rx="8" ry="10" fill="#00d4ff" className="animate-glow-pulse" />
                        <ellipse cx="115" cy="65" rx="8" ry="10" fill="#00d4ff" className="animate-glow-pulse" />
                        <circle cx="85" cy="65" r="4" fill="#0f172a" />
                        <circle cx="115" cy="65" r="4" fill="#0f172a" />
                        <circle cx="86" cy="63" r="1.5" fill="white" />
                        <circle cx="116" cy="63" r="1.5" fill="white" />
                        
                        {/* Nose */}
                        <path d="M100 78 L96 85 L104 85 Z" fill="#f472b6" />
                        
                        {/* Mouth */}
                        <path d="M100 85 C95 92 90 88 90 88" stroke="#6b7280" strokeWidth="1.5" fill="none" />
                        <path d="M100 85 C105 92 110 88 110 88" stroke="#6b7280" strokeWidth="1.5" fill="none" />
                        
                        {/* Whiskers */}
                        <g stroke="#9ca3af" strokeWidth="0.8">
                          <line x1="75" y1="80" x2="50" y2="75" />
                          <line x1="75" y1="85" x2="50" y2="85" />
                          <line x1="75" y1="90" x2="50" y2="95" />
                          <line x1="125" y1="80" x2="150" y2="75" />
                          <line x1="125" y1="85" x2="150" y2="85" />
                          <line x1="125" y1="90" x2="150" y2="95" />
                        </g>
                        
                        {/* Paws */}
                        <ellipse cx="65" cy="165" rx="15" ry="10" fill="url(#catGradient)" />
                        <ellipse cx="135" cy="165" rx="15" ry="10" fill="url(#catGradient)" />
                        
                        {/* Tail */}
                        <path 
                          d="M155 130 Q180 130 175 100 Q170 80 185 70" 
                          stroke="url(#catGradient)" 
                          strokeWidth="12" 
                          strokeLinecap="round"
                          fill="none"
                          filter="url(#catGlow)"
                        />
                      </svg>

                      {/* Organ Overlay */}
                      {showOrganOverlay && (
                        <OrganOverlay
                          mode={hudMode}
                          progress={scrollProgress}
                          className="absolute inset-0"
                        />
                      )}
                    </div>
                  ) : (
                    // Fallback 2D illustration
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">🐱</div>
                      <p className="text-sm">3D model devre dışı</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Content & HUD */}
            <div className="order-1 lg:order-2 space-y-8">
              {/* Section Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-medical-blue text-sm font-medium tracking-wider uppercase">
                  Scroll Deneyimi
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                  Sağlık Taraması
                </h2>
                <p className="text-gray-400 mt-4">
                  Modern teknolojimiz ile dostunuzun sağlık durumunu detaylı analiz ediyoruz.
                </p>
              </motion.div>

              {/* Progress Steps */}
              <div className="space-y-4">
                {scrollExperienceSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'p-4 rounded-xl transition-all duration-300',
                      currentStep === index
                        ? 'glass-dark border border-medical-blue/30 medical-glow'
                        : 'bg-gray-800/30'
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                          currentStep >= index
                            ? 'bg-medical-blue text-white'
                            : 'bg-gray-700 text-gray-400'
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{step.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* HUD Display */}
              {showOrganOverlay && (
                <HUD
                  mode={hudMode}
                  visible={showOrganOverlay}
                  className="mt-8"
                />
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
