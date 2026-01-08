'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Phone, Clock } from 'lucide-react'
import { siteInfo } from '@/data/siteData'

export default function WhatsappButton() {
  const [isOpen, setIsOpen] = useState(false)
  const phoneNumber = siteInfo.whatsapp || '905534845424'
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Merhaba, WETNOSE Veteriner Kliniği hakkında bilgi almak istiyorum.')}`

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-72 bg-[#0a0f1a] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold">WETNOSE Destek</h4>
                  <p className="text-green-100 text-sm">Genellikle anında yanıt</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="bg-white/5 rounded-xl p-3 mb-4">
                <p className="text-gray-300 text-sm">
                  Merhaba! 👋 Size nasıl yardımcı olabiliriz? Randevu, acil durum veya sorularınız için bize yazın.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-gray-400 text-xs mb-4">
                <Clock className="w-3 h-3" />
                <span>7/24 Hizmetinizdeyiz</span>
              </div>

              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Sohbete Başla</span>
              </motion.a>

              <a
                href={`tel:${siteInfo.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center space-x-2 w-full py-3 mt-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Veya Hemen Ara</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/30 flex items-center justify-center"
      >
        {/* Pulse Animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-white text-xs font-bold">1</span>
          </motion.div>
        )}
      </motion.button>

      {/* Label */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-20 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap"
        >
          7/24 Acil Destek
        </motion.div>
      )}
    </div>
  )
}
