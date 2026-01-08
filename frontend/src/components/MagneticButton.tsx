'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'header'
}

export default function MagneticButton({
  children,
  className,
  href,
  onClick,
  variant = 'primary',
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current!.getBoundingClientRect()
    const x = (clientX - left - width / 2) * 0.3
    const y = (clientY - top - height / 2) * 0.3
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const variants = {
    primary: 'bg-teal-500/25 backdrop-blur-xl border border-teal-400/35 text-white hover:bg-teal-500/35 hover:border-teal-400/50',
    secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/15',
    ghost: 'text-white hover:text-cyan-400',
    header: 'bg-teal-500/25 backdrop-blur-xl border border-teal-400/35 text-white hover:bg-teal-500/35 hover:border-teal-400/50',
  }

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={cn(
        'relative inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold transition-all duration-500 overflow-hidden group',
        variants[variant],
        className
      )}
      data-cursor="pointer"
    >
      {/* Auto Shine effect - subtle continuous animation */}
      {(variant === 'primary' || variant === 'header') && !isHovered && (
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={false}
        >
          <motion.div 
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-transparent to-transparent skew-x-12",
              variant === 'primary' ? 'via-white/20' : 'via-white/15'
            )}
            animate={{ x: ['-150%', '150%'] }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              repeatDelay: 4,
              ease: [0.4, 0, 0.2, 1]
            }}
          />
        </motion.div>
      )}
      
      {/* Glass Hover Effect - elegant frosted glass shine */}
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
        initial={false}
      >
        {/* Soft glass reflection layer */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Top glass highlight */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
          
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-cyan-400/10" />
        </motion.div>

        {/* Smooth gliding shine on hover */}
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 blur-sm"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '400%' : '-100%' }}
          transition={{ 
            duration: 0.8, 
            ease: [0.4, 0, 0.2, 1]
          }}
        />
      </motion.div>

      {/* Subtle border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          boxShadow: isHovered 
            ? 'inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.1)' 
            : 'inset 0 0 0 rgba(255,255,255,0)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      <span className="relative z-10">{children}</span>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <button onClick={onClick}>
      {content}
    </button>
  )
}
