'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  blur?: boolean
}

export default function SectionReveal({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  blur = true
}: SectionRevealProps) {
  const directions = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 },
    none: { y: 0, x: 0 }
  }

  const { x, y } = directions[direction]

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        y, 
        x,
        scale: 0.95,
        filter: blur ? 'blur(10px)' : 'blur(0px)'
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        x: 0,
        scale: 1,
        filter: 'blur(0px)'
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  )
}

// Stagger Container for multiple items
export function StaggerContainer({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}: { 
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Stagger Item
export function StaggerItem({ 
  children, 
  className = '',
  direction = 'up'
}: { 
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 }
  }

  const { x, y } = directions[direction]

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { 
          opacity: 0, 
          y,
          x,
          scale: 0.9,
          filter: 'blur(8px)'
        },
        visible: { 
          opacity: 1, 
          y: 0, 
          x: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1]
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}
