'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsappButton from '@/components/WhatsappButton'
import { siteInfo } from '@/data/siteData'
import { 
  Phone, Mail, MapPin, Clock, Send, CheckCircle, 
  Instagram, Facebook, MessageCircle, Navigation
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${apiUrl}/api/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setSent(true)
        setTimeout(() => {
          setSent(false)
          setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        }, 3000)
      } else {
        const data = await response.json()
        alert(data.detail || 'Mesaj gönderilemedi. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      alert('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-300 text-sm font-medium mb-6">
              <Phone className="w-4 h-4" />
              Bize Ulaşın
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              İletişim
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Sorularınız için bize ulaşın. Uzman ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="pb-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">İletişim Bilgileri</h2>
                
                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-start gap-4 p-5 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-teal-500/30 transition-colors">
                    <div className="p-3 bg-teal-500/20 rounded-xl">
                      <Phone className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Telefon</h3>
                      <a href={`tel:${siteInfo.phone.replace(/\s/g, '')}`} className="text-gray-400 hover:text-teal-400 block">
                        {siteInfo.phone}
                      </a>
                      {siteInfo.phone2 && (
                        <a href={`tel:${siteInfo.phone2.replace(/\s/g, '')}`} className="text-gray-400 hover:text-teal-400 block">
                          {siteInfo.phone2}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4 p-5 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-teal-500/30 transition-colors">
                    <div className="p-3 bg-teal-500/20 rounded-xl">
                      <Mail className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">E-posta</h3>
                      <a href={`mailto:${siteInfo.email}`} className="text-gray-400 hover:text-teal-400">
                        {siteInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4 p-5 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-teal-500/30 transition-colors">
                    <div className="p-3 bg-teal-500/20 rounded-xl">
                      <MapPin className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Adres</h3>
                      <p className="text-gray-400">{siteInfo.address}</p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-4 p-5 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-teal-500/30 transition-colors">
                    <div className="p-3 bg-teal-500/20 rounded-xl">
                      <Clock className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Çalışma Saatleri</h3>
                      <p className="text-gray-400">Pazartesi - Cumartesi: 09:00 - 20:00</p>
                      <p className="text-gray-400">Pazar: 10:00 - 18:00</p>
                      <p className="text-teal-400 text-sm mt-1">Acil durumlar için 7/24 ulaşılabilir</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-white font-semibold mb-4">Sosyal Medya</h3>
                <div className="flex gap-3">
                  <a
                    href={siteInfo.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-purple-400 hover:text-white hover:border-purple-400 transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href={siteInfo.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:text-white hover:border-blue-400 transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a
                    href={`https://wa.me/${siteInfo.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 hover:text-white hover:border-green-400 transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${siteInfo.whatsapp}?text=Merhaba,%20bilgi%20almak%20istiyorum.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp ile Yaz
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  Yol Tarifi Al
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Bize Mesaj Gönderin</h2>
                
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-white font-semibold text-xl mb-2">Mesajınız Gönderildi!</h3>
                    <p className="text-gray-400">En kısa sürede size dönüş yapacağız.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Ad Soyad</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                          placeholder="Adınız"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                          placeholder="E-posta adresiniz"
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Telefon</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                          placeholder="Telefon numaranız"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Konu</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          required
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-teal-500 focus:outline-none transition-colors"
                        >
                          <option value="">Konu seçin</option>
                          <option value="randevu">Randevu Talebi</option>
                          <option value="bilgi">Bilgi Almak İstiyorum</option>
                          <option value="sikayet">Öneri / Şikayet</option>
                          <option value="diger">Diğer</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Mesajınız</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors resize-none"
                        placeholder="Mesajınızı yazın..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={sending}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all",
                        sending
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/25"
                      )}
                    >
                      {sending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Gönder
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3019.8456456456!2d29.9167!3d40.7667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ2JzAwLjEiTiAyOcKwNTUnMDAuMSJF!5e0!3m2!1str!2str!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
          </div>
        </div>
      </section>

      <Footer />
      <WhatsappButton />
    </main>
  )
}
