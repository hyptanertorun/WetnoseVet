'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from 'lucide-react'
import { siteInfo } from '@/data/siteData'
import { cn } from '@/lib/utils'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    petName: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitted(true)
    
    // Reset form
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '', petName: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-medical-blue text-sm font-medium tracking-wider uppercase">
            Bize Ulaşın
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mt-2">
            İletişim
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Sorularınız için bize ulaşın veya doğrudan randevu alın
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Contact Cards */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-medical-blue/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-medical-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Telefon</h4>
                  <a href={`tel:${siteInfo.phone.replace(/\s/g, '')}`} className="text-gray-600 hover:text-medical-blue transition-colors">
                    {siteInfo.phone}
                  </a>
                  <br />
                  <a href={`tel:${siteInfo.phone2.replace(/\s/g, '')}`} className="text-gray-600 hover:text-medical-blue transition-colors">
                    {siteInfo.phone2}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-medical-blue/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-medical-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">E-posta</h4>
                  <a href={`mailto:${siteInfo.email}`} className="text-gray-600 hover:text-medical-blue transition-colors">
                    {siteInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-medical-blue/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-medical-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Adres</h4>
                  <p className="text-gray-600">{siteInfo.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-medical-blue/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-medical-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Çalışma Saatleri</h4>
                  <p className="text-gray-600">Pazartesi - Pazar: 7/24</p>
                  <p className="text-sm text-medical-blue">Acil Hizmet Her Zaman</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${siteInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp ile Hızlı İletişim</span>
            </a>

            {/* Map Placeholder */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d29.92!3d40.76!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzM2LjAiTiAyOcKwNTUnMTIuMCJF!5e0!3m2!1sen!2str!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
                📍 İzmit, Kocaeli
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Randevu Formu
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Adınız *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">
                    Dostunuzun Adı
                  </label>
                  <input
                    type="text"
                    id="petName"
                    name="petName"
                    value={formData.petName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                    placeholder="Pamuk, Max, vb."
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all resize-none"
                    placeholder="Nasıl yardımcı olabiliriz?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || submitted}
                  className={cn(
                    'w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2',
                    submitted
                      ? 'bg-green-500 text-white'
                      : 'btn-premium'
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : submitted ? (
                    <>
                      <span>✓</span>
                      <span>Gönderildi!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
