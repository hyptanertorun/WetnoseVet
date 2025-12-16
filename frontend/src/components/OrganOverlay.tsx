'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OrganOverlayProps {
  mode: 'general' | 'digestion'
  progress: number // 0 to 1
  className?: string
}

export default function OrganOverlay({ mode, progress, className }: OrganOverlayProps) {
  const opacity = Math.min(progress * 2, 1)

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <svg
        viewBox="0 0 400 500"
        className="w-full h-full"
        style={{ opacity }}
      >
        <defs>
          {/* Glow filters */}
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-teal" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient definitions */}
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#0099cc" />
          </linearGradient>
          <linearGradient id="lungGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#0077b6" />
          </linearGradient>
          <linearGradient id="digestiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        {/* Heart - only in general mode */}
        {mode === 'general' && (
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            filter="url(#glow-blue)"
          >
            {/* Stylized Heart Shape */}
            <motion.path
              d="M200 140 
                 C200 120 180 100 160 100 
                 C130 100 120 130 120 150 
                 C120 190 200 240 200 240 
                 C200 240 280 190 280 150 
                 C280 130 270 100 240 100 
                 C220 100 200 120 200 140 Z"
              fill="none"
              stroke="url(#heartGradient)"
              strokeWidth="2.5"
              className="animate-glow-pulse"
            />
            {/* Heart pulse lines */}
            <motion.path
              d="M140 170 L160 170 L170 150 L180 190 L190 160 L200 170 L260 170"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            />
          </motion.g>
        )}

        {/* Lungs - only in general mode */}
        {mode === 'general' && (
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            filter="url(#glow-teal)"
          >
            {/* Left Lung */}
            <motion.ellipse
              cx="140"
              cy="200"
              rx="50"
              ry="70"
              fill="none"
              stroke="url(#lungGradient)"
              strokeWidth="2"
              className="animate-breathe"
            />
            {/* Right Lung */}
            <motion.ellipse
              cx="260"
              cy="200"
              rx="50"
              ry="70"
              fill="none"
              stroke="url(#lungGradient)"
              strokeWidth="2"
              className="animate-breathe"
              style={{ animationDelay: '0.5s' }}
            />
            {/* Trachea */}
            <motion.path
              d="M200 100 L200 150 L140 170 M200 150 L260 170"
              fill="none"
              stroke="url(#lungGradient)"
              strokeWidth="1.5"
            />
          </motion.g>
        )}

        {/* Digestive System - both modes */}
        <motion.g
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: mode === 'general' ? 0.4 : 0 }}
          filter="url(#glow-teal)"
        >
          {/* Stomach */}
          <motion.path
            d="M200 280 
               C160 280 140 310 150 340 
               C160 370 200 380 220 370 
               C240 360 260 340 250 310 
               C240 280 220 280 200 280 Z"
            fill="none"
            stroke="url(#digestiveGradient)"
            strokeWidth="2"
            className="animate-pulse"
          />
          {/* Esophagus */}
          <motion.path
            d="M200 250 L200 280"
            fill="none"
            stroke="url(#digestiveGradient)"
            strokeWidth="1.5"
          />
          {/* Intestines - simplified wavy line */}
          <motion.path
            d="M200 380 
               C180 400 160 410 170 430 
               C180 450 220 450 230 430 
               C240 410 220 400 200 420 
               C180 440 190 460 210 460"
            fill="none"
            stroke="url(#digestiveGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Connection lines / scan effect */}
        <motion.line
          x1="50"
          y1="0"
          x2="50"
          y2="500"
          stroke="rgba(0, 212, 255, 0.3)"
          strokeWidth="1"
          strokeDasharray="5,5"
          initial={{ y1: -500 }}
          animate={{ y1: 500 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.line
          x1="350"
          y1="500"
          x2="350"
          y2="0"
          stroke="rgba(0, 212, 255, 0.3)"
          strokeWidth="1"
          strokeDasharray="5,5"
          initial={{ y1: 1000 }}
          animate={{ y1: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
        />
      </svg>
    </div>
  )
}
