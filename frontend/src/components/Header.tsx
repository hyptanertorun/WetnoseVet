'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Sparkles } from 'lucide-react'
import { siteInfo, navLinks } from '@/data/siteData'
import MagneticButton from './MagneticButton'
import { cn } from '@/lib/utils'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#hero"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center group"
            data-cursor="pointer"
          >
            <motion.img
              src="https://customer-assets.emergentagent.com/job_vet-revamp/artifacts/hy1fmh1w_logo_anasayfa.png"
              alt="WETNOSE Veteriner Kliniği"
              className="h-16 lg:h-20 w-auto brightness-0 invert"
              whileHover={{ scale: 1.05 }}
            />
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
                data-cursor="pointer"
              >
                {link.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-medical-blue to-teal-400 transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <motion.a
              href={`tel:${siteInfo.phone.replace(/\s/g, '')}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-sm text-gray-300 hover:text-medical-blue transition-colors"
              data-cursor="pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{siteInfo.phone}</span>
            </motion.a>
            <MagneticButton href="#contact" variant="primary" className="!py-2.5 !px-5 !text-sm">
              Randevu Al
            </MagneticButton>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white"
            data-cursor="pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="mt-4 mx-4 p-6 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10">
              <nav className="space-y-4">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-300 hover:text-white transition-colors py-2"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <a
                  href={`tel:${siteInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-center space-x-2 text-gray-300"
                >
                  <Phone className="w-4 h-4" />
                  <span>{siteInfo.phone}</span>
                </a>
                <MagneticButton href="#contact" variant="primary" className="w-full !justify-center">
                  Randevu Al
                </MagneticButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
