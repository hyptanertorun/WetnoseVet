'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { PawPrint } from 'lucide-react'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Paw Icon Top */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <PawPrint className="w-5 h-5 text-teal-400" />
        </motion.div>
        
        {/* Progress Track */}
        <div className="relative w-2 h-40 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-500 via-cyan-400 to-teal-400 rounded-full origin-bottom"
            style={{ scaleY, height: '100%' }}
          />
          
          {/* Glow Effect */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-teal-400 blur-md rounded-full"
            style={{ scaleY, height: '100%', opacity: 0.5 }}
          />
        </div>
        
        {/* Paw Icon Bottom */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <PawPrint className="w-5 h-5 text-teal-500 fill-teal-500/30" />
        </motion.div>
      </motion.div>

      {/* Mobile Progress - Top Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 origin-left"
          style={{ scaleX: scrollYProgress }}
        />
      </motion.div>
    </>
  )
}
