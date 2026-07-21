'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import { navLinks } from '@/data/siteData'
import MagneticButton from './MagneticButton'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface PublicSettings {
  phone: string
  whatsapp: string
  email: string
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<PublicSettings | null>(null)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Fetch settings
    fetch(`${API_URL}/api/public/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
        isScrolled
          ? 'py-2'
          : 'py-4'
      )}
    >
      {/* Glassmorphism Background */}
      <motion.div
        className="absolute inset-0 transition-all duration-700"
        initial={false}
        animate={{
          backgroundColor: isScrolled ? 'rgba(20, 184, 166, 0.15)' : 'rgba(0, 0, 0, 0)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
        }}
      />
      
      {/* Gradient Border Bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        initial={false}
        animate={{
          opacity: isScrolled ? 1 : 0,
          background: 'linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.5), rgba(6, 182, 212, 0.5), transparent)',
        }}
      />

      {/* Subtle Glow Effect */}
      {isScrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none"
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center group relative z-10"
          >
            <Link href="/">
              <Image
                src="/images/brand/logo.png"
                alt="WETNOSE Veteriner Kliniği"
                width={200}
                height={80}
                priority
                className={cn(
                  "brightness-0 invert transition-all duration-500 cursor-pointer",
                  isScrolled ? "h-14 lg:h-16 w-auto" : "h-16 lg:h-20 w-auto"
                )}
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mounted && navLinks.map((link, index) => (
              <Link key={link.name} href={link.href}>
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-all duration-300 group block"
                  data-cursor="pointer"
                >
                  <span className="relative z-10">{link.name}</span>
                  {/* Hover Background */}
                  <motion.span 
                    className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/10 transition-all duration-300"
                  />
                  {/* Underline */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-300 group-hover:w-3/4 rounded-full" />
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <motion.a
              href={`tel:${(settings?.phone || '').replace(/\s/g, '')}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 text-sm text-white/80 hover:text-cyan-400 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-white/5"
              data-cursor="pointer"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">{settings?.phone || ''}</span>
            </motion.a>
            <MagneticButton href="/randevu" variant="header" className="!py-2.5 !px-5 !text-sm">
              Online Randevu Al
            </MagneticButton>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white"
            data-cursor="pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && mounted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden relative"
          >
            <div className="mt-4 mx-4 p-6 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10">
              <nav className="space-y-3">
                {navLinks.map((link, index) => (
                  <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="block text-white/80 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <a
                  href={`tel:${(settings?.phone || '').replace(/\s/g, '')}`}
                  className="flex items-center space-x-2 text-white/80 px-3"
                >
                  <Phone className="w-4 h-4" />
                  <span>{settings?.phone || ''}</span>
                </a>
                <MagneticButton href="/randevu" variant="primary" className="w-full !justify-center">
                  Online Randevu Al
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
