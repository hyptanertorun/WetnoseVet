'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TextRevealProps {
  children: string
  className?: string
  delay?: number
  staggerDelay?: number
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  gradient?: boolean
}

export default function TextReveal({
  children,
  className,
  delay = 0,
  staggerDelay = 0.03,
  tag: Tag = 'span',
  gradient = false,
}: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const words = children.split(' ')

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: staggerDelay, delayChildren: delay },
    }),
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <Tag ref={ref} className={cn('inline-block', className)}>
      <motion.span
        variants={container}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="inline-flex flex-wrap"
        style={{ perspective: '1000px' }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={child}
            className={cn(
              'inline-block mr-[0.25em]',
              gradient && 'text-transparent bg-clip-text bg-gradient-to-r from-medical-blue via-teal-400 to-medical-blue bg-[length:200%_auto] animate-gradient'
            )}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}

// Character by character reveal for more dramatic effect
export function CharacterReveal({
  children,
  className,
  delay = 0,
  staggerDelay = 0.02,
}: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const characters = children.split('')

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: staggerDelay, delayChildren: delay },
    },
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <span ref={ref} className={className}>
      <motion.span
        variants={container}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="inline-flex"
      >
        {characters.map((char, index) => (
          <motion.span
            key={index}
            variants={child}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </span>
  )
}
