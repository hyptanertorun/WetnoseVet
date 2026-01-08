'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  value: string
  duration?: number
  className?: string
}

export default function AnimatedCounter({ value, duration = 2, className = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [displayValue, setDisplayValue] = useState('0')
  
  useEffect(() => {
    if (!isInView) return
    
    // Extract number and suffix (e.g., "10,000+" -> 10000, "+")
    const numMatch = value.match(/[\d,]+/)
    const suffix = value.replace(/[\d,]+/, '')
    
    if (!numMatch) {
      setDisplayValue(value)
      return
    }
    
    const targetNum = parseInt(numMatch[0].replace(/,/g, ''))
    const startTime = Date.now()
    const durationMs = duration * 1000
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentNum = Math.floor(targetNum * easeOut)
      
      // Format with commas
      const formatted = currentNum.toLocaleString()
      setDisplayValue(formatted + suffix)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [isInView, value, duration])
  
  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {displayValue}
    </motion.span>
  )
}
