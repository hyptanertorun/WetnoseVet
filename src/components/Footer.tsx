'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, Phone, Mail, Clock, Send, Heart,
  Facebook, Instagram, Twitter, MessageCircle,
  Stethoscope, Syringe, Scissors, AlertCircle,
  ChevronRight, Sparkles, Youtube
} from 'lucide-react'
import { siteInfo } from '@/data/siteData'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Pinterest icon (not in lucide-react)
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
  </svg>
)

// TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
)

interface SocialLinks {
  facebook: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  pinterest: string | null
  tiktok: string | null
}

interface PublicSettings {
  clinic_name: string
  phone: string
  whatsapp: string
  email: string
  address: string
  social_links: SocialLinks
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

const quickLinks = [
  { name: 'Ana Sayfa', href: '/' },
  { name: 'Hizmetlerimiz', href: '/hizmetler' },
  { name: 'Sağlık Rehberi', href: '/saglik-rehberi' },
  { name: 'Ekibimiz', href: '/ekibimiz' },
  { name: 'Hakkımızda', href: '/hakkimizda' },
  { name: 'Randevu', href: '/randevu' },
  { name: 'Memnuniyetiniz', href: '/geri-bildirim' },
]

const services = [
  { name: 'Genel Muayene', icon: Stethoscope },
  { name: 'Aşılama', icon: Syringe },
  { name: 'Cerrahi', icon: Scissors },
  { name: 'Acil Servis', icon: AlertCircle },
]

// Medyatik Interactive Credit Component - Tulpar Style with Favicon
function MedyatikCredit() {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.a
      href="https://www.medyatikinteractive.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center cursor-pointer py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left Line */}
      <motion.div 
        className="h-[1px] bg-gradient-to-r from-transparent to-white/30"
        initial={{ width: 0 }}
        animate={{ width: isHovered ? 50 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      
      {/* Designed By Text */}
      <motion.div
        className="overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: isHovered ? 'auto' : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase px-3 whitespace-nowrap">
          DESIGNED BY
        </span>
      </motion.div>
      
      {/* Round Favicon Logo */}
      <motion.div
        className="relative flex items-center justify-center mx-1"
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute w-8 h-8 bg-yellow-500/30 rounded-full blur-lg"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: isHovered ? 0.8 : 0, scale: isHovered ? 1.3 : 0.5 }}
          transition={{ duration: 0.4 }}
        />
        {/* Round Favicon */}
        <motion.div
          className="relative w-5 h-5 rounded-full overflow-hidden border"
          animate={{ 
            borderColor: isHovered ? 'rgba(250, 204, 21, 0.6)' : 'rgba(250, 204, 21, 0.2)',
            boxShadow: isHovered ? '0 0 12px rgba(250, 204, 21, 0.4)' : '0 0 0px rgba(250, 204, 21, 0)',
            opacity: isHovered ? 1 : 0.6
          }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src="https://www.medyatikinteractive.com/favicon.ico" 
            alt="Medyatik Interactive"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>
      
      {/* Medyatik Interactive Text */}
      <motion.div
        className="overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: isHovered ? 'auto' : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      >
        <span className="text-white/70 text-[10px] tracking-[0.15em] uppercase px-3 whitespace-nowrap">
          MEDYATİK İNTERACTİVE
        </span>
      </motion.div>
      
      {/* Right Line */}
      <motion.div 
        className="h-[1px] bg-gradient-to-l from-transparent to-white/30"
        initial={{ width: 0 }}
        animate={{ width: isHovered ? 50 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.a>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [settings, setSettings] = useState<PublicSettings | null>(null)

  // Fetch settings on mount
  useEffect(() => {
    fetch(`${API_URL}/api/public/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error)
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail('')
      }, 3000)
    }
  }

  // Build dynamic social links
  const socialLinks = [
    settings?.social_links?.facebook && { name: 'Facebook', icon: Facebook, href: settings.social_links.facebook, color: 'hover:text-blue-400' },
    settings?.social_links?.instagram && { name: 'Instagram', icon: Instagram, href: settings.social_links.instagram, color: 'hover:text-pink-400' },
    settings?.social_links?.twitter && { name: 'Twitter', icon: Twitter, href: settings.social_links.twitter, color: 'hover:text-sky-400' },
    settings?.social_links?.youtube && { name: 'YouTube', icon: Youtube, href: settings.social_links.youtube, color: 'hover:text-red-500' },
    settings?.social_links?.pinterest && { name: 'Pinterest', icon: PinterestIcon, href: settings.social_links.pinterest, color: 'hover:text-red-400' },
    settings?.social_links?.tiktok && { name: 'TikTok', icon: TikTokIcon, href: settings.social_links.tiktok, color: 'hover:text-white' },
    { name: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/${settings?.whatsapp || '905534845424'}`, color: 'hover:text-green-400' },
  ].filter(Boolean) as { name: string; icon: React.ComponentType<{className?: string}>; href: string; color: string }[]

  return (
    <footer className="relative bg-[#030712] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Top Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {/* Animated Logo */}
            <motion.div className="inline-block relative mb-4">
              <Link href="/">
                <motion.div
                  className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <img
                  src="/images/brand/logo.png"
                  alt="WETNOSE Veteriner Kliniği"
                  className="relative h-16 lg:h-20 w-auto brightness-0 invert cursor-pointer hover:scale-105 transition-transform"
                />
              </Link>
            </motion.div>
            <p className="text-gray-400 max-w-md mx-auto">
              Patili dostlarınızın sağlığı için 7/24 yanınızdayız. 
              Modern tesislerimiz ve uzman kadromuzla hizmetinizdeyiz.
            </p>
          </motion.div>

          {/* 4 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-teal-400" />
                </div>
                Hızlı Erişim
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onMouseEnter={() => setHoveredLink(link.name)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className="group flex items-center text-gray-400 hover:text-teal-400 transition-colors duration-300"
                    >
                      <motion.span
                        animate={{ x: hoveredLink === link.name ? 5 : 0 }}
                        className="mr-2 text-teal-500/50 group-hover:text-teal-400"
                      >
                        ›
                      </motion.span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-teal-400" />
                </div>
                Hizmetlerimiz
              </h3>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      href="/hizmetler"
                      className="group flex items-center text-gray-400 hover:text-teal-400 transition-colors duration-300"
                    >
                      <service.icon className="w-4 h-4 mr-3 text-teal-500/50 group-hover:text-teal-400 transition-colors" />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-teal-400" />
                </div>
                İletişim
              </h3>
              <ul className="space-y-4">
                <li>
                  <a 
                    href={`https://maps.app.goo.gl/4txq8rudU2TQm9HE9`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-400 hover:text-teal-400 transition-colors group"
                  >
                    <MapPin className="w-5 h-5 text-teal-500/50 group-hover:text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{settings?.address || siteInfo.address}</span>
                  </a>
                </li>
                <li>
                  <a 
                    href={`tel:${(settings?.phone || siteInfo.phone).replace(/\s/g, '')}`}
                    className="flex items-center gap-3 text-gray-400 hover:text-teal-400 transition-colors group"
                  >
                    <Phone className="w-5 h-5 text-teal-500/50 group-hover:text-teal-400" />
                    <span>{settings?.phone || siteInfo.phone}</span>
                  </a>
                </li>
                <li>
                  <a 
                    href={`mailto:${settings?.email || siteInfo.email}`}
                    className="flex items-center gap-3 text-gray-400 hover:text-teal-400 transition-colors group"
                  >
                    <Mail className="w-5 h-5 text-teal-500/50 group-hover:text-teal-400" />
                    <span>{settings?.email || siteInfo.email}</span>
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Clock className="w-5 h-5 text-teal-500/50" />
                  <div className="flex items-center gap-2">
                    <span>7/24 Açık</span>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-teal-400" />
                </div>
                Bülten
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Sağlık ipuçları ve kampanyalardan haberdar olun
              </p>
              
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="w-full px-4 py-3 rounded-xl bg-teal-500/10 border border-teal-400/20 text-white placeholder-gray-500 outline-none focus:border-teal-400/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all"
                    required
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300",
                    isSubscribed
                      ? "bg-green-500/20 border border-green-400/30 text-green-400"
                      : "bg-teal-500/20 border border-teal-400/30 text-white hover:bg-teal-500/30 hover:border-teal-400/50"
                  )}
                >
                  {isSubscribed ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Abone Oldunuz!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Abone Ol
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teal-400/10 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/20 flex items-center justify-center text-gray-400 transition-all duration-300 hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]",
                    social.color
                  )}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>© {new Date().getFullYear()} WETNOSE Veteriner Kliniği.</span>
              <span className="hidden sm:inline">Tüm hakları saklıdır.</span>
            </div>

            {/* Empty space for alignment */}
            <div className="w-[200px] hidden md:block" />
          </div>
        </div>
        
        {/* Medyatik Interactive Credit - Bottom Center */}
        <div className="border-t border-white/5">
          <MedyatikCredit />
        </div>
      </div>
    </footer>
  )
}
