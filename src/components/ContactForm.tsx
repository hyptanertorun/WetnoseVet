'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Navigation, MessageCircle, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import { siteInfo } from '@/data/siteData'
import Link from 'next/link'

export default function ContactForm() {
  const contactCards = [
    {
      icon: Phone,
      label: 'Telefon',
      value: siteInfo.phone,
      subValue: siteInfo.phone2,
      href: `tel:${siteInfo.phone.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: 'E-posta',
      value: siteInfo.email,
      href: `mailto:${siteInfo.email}`,
    },
    {
      icon: Clock,
      label: 'Çalışma Saatleri',
      value: '7/24 Açık',
      subValue: 'Acil hizmet her zaman',
    },
  ]

  return (
    <section id="contact" className="relative min-h-screen overflow-hidden">
      {/* Full Width Map Background */}
      <div className="absolute inset-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3046.5!2d29.9419!3d40.7656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cb4f9a6a0e2c4d%3A0x8b1a2b3c4d5e6f7a!2sWetnose%20Veteriner%20Klini%C4%9Fi!5e0!3m2!1str!2str!4v1702800000000!5m2!1str!2str"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale opacity-40"
        />
        {/* Dark Overlay with Grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/95 via-[#030712]/85 to-[#030712]/95" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-6 shadow-lg shadow-teal-500/10"
          >
            <MapPin className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">Bize Ulaşın</span>
          </motion.div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mt-2">
            İletişime
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300"> Geçin</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Sorularınız için bize ulaşın veya doğrudan online randevu alın
          </p>
        </motion.div>

        {/* Floating Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {contactCards.map((card, index) => (
            <motion.a
              key={card.label}
              href={card.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-teal-500/10 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 hover:border-teal-400/50 hover:bg-teal-500/15 hover:shadow-[0_0_40px_rgba(20,184,166,0.15)] transition-all duration-500"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl bg-teal-500" />

              <div className="relative flex items-start space-x-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-teal-500/25 backdrop-blur-xl border border-teal-400/30 shadow-lg group-hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-shadow duration-500">
                  <card.icon className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{card.label}</p>
                  <p className="text-white font-semibold text-lg group-hover:text-teal-400 transition-colors">
                    {card.value}
                  </p>
                  {card.subValue && (
                    <p className="text-gray-500 text-sm mt-1">{card.subValue}</p>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <motion.div
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Navigation className="w-5 h-5 text-teal-400" />
              </motion.div>
            </motion.a>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Address & Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Address Card */}
            <div className="bg-teal-500/10 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 hover:border-teal-400/40 transition-all duration-500">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/25 backdrop-blur-xl border border-teal-400/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/25">
                  <MapPin className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">Adresimiz</h4>
                  <p className="text-gray-400 leading-relaxed">{siteInfo.address}</p>
                </div>
              </div>
            </div>

            {/* Map Preview with Animated Pin */}
            <div className="relative h-72 rounded-2xl overflow-hidden border border-teal-400/20 group hover:border-teal-400/40 transition-all duration-500">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3046.5!2d29.9419!3d40.7656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cb4f9a6a0e2c4d%3A0x8b1a2b3c4d5e6f7a!2sWetnose%20Veteriner%20Klini%C4%9Fi!5e0!3m2!1str!2str!4v1702800000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="group-hover:grayscale-0 grayscale-[50%] transition-all duration-700"
              />
              
              {/* Animated Location Pin with Pulse */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                {/* Pulse Rings */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-teal-400/50"
                  animate={{ scale: [1, 2, 2], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-teal-400/50"
                  animate={{ scale: [1, 2, 2], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-teal-400/50"
                  animate={{ scale: [1, 2, 2], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
                />
                
                {/* Pin */}
                <motion.div
                  className="relative"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="relative">
                    <MapPin className="w-12 h-12 text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.8)]" fill="rgba(20, 184, 166, 0.3)" />
                    {/* Inner Glow */}
                    <div className="absolute inset-0 w-12 h-12 bg-teal-400/30 blur-xl rounded-full" />
                  </div>
                  {/* Shadow */}
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/40 rounded-full blur-sm"
                    animate={{ scale: [1, 0.7, 1], opacity: [0.6, 0.3, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/80 via-transparent to-transparent pointer-events-none" />
              
              {/* CTA */}
              <a
                href="https://maps.app.goo.gl/4txq8rudU2TQm9HE9"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 right-4 flex items-center justify-center space-x-2 bg-teal-500/25 backdrop-blur-xl border border-teal-400/35 hover:bg-teal-500/35 hover:border-teal-400/50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/25 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] group/btn"
              >
                <Navigation className="w-5 h-5 group-hover/btn:rotate-45 transition-transform duration-300" />
                <span>Yol Tarifi Al</span>
              </a>
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              href="https://wa.me/905534845424"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/25 overflow-hidden group"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <MessageCircle className="w-6 h-6 relative z-10" />
              <span className="relative z-10">WhatsApp ile Hızlı İletişim</span>
            </motion.a>
          </motion.div>

          {/* Right - Randevu CTA Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-gradient-to-br from-teal-500/20 to-cyan-500/10 backdrop-blur-xl border border-teal-400/30 rounded-3xl p-8 overflow-hidden hover:border-teal-400/50 transition-all duration-500 h-full flex flex-col">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
              
              {/* Floating Paw Prints */}
              <motion.div 
                className="absolute top-10 right-10 text-teal-400/20 text-4xl"
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🐾
              </motion.div>
              <motion.div 
                className="absolute bottom-20 left-10 text-teal-400/15 text-3xl"
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              >
                🐾
              </motion.div>

              <div className="relative flex-1 flex flex-col">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/30"
                  >
                    <Calendar className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3">Online Randevu</h3>
                  <p className="text-gray-400">
                    Hizmet seçimi ve saat tercihiyle kolayca randevu alın
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8 flex-1">
                  {[
                    { icon: '📅', text: 'Tarih ve saat seçimi' },
                    { icon: '🏥', text: 'Hizmet türü seçimi' },
                    { icon: '🐱', text: 'Kedi veya köpek için özel' },
                    { icon: '⚡', text: 'Anında onay' },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <span className="text-xl">{feature.icon}</span>
                      <span>{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href="/randevu">
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(20,184,166,0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full py-5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-teal-500/30 overflow-hidden group cursor-pointer"
                  >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    <Sparkles className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Online Randevu Al</span>
                    <motion.div
                      className="relative z-10"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.div>
                </Link>

                {/* Info Note */}
                <p className="text-center text-gray-500 text-sm mt-4">
                  Acil durumlar için <a href="tel:05534845424" className="text-teal-400 hover:underline">0553 484 54 24</a> numarasını arayın
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
