'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Calendar, Clock, Phone, User, PawPrint, Send, CheckCircle, ArrowRight, Heart, Shield, Sparkles, MessageCircle } from 'lucide-react'
import TestimonialsSection from '@/components/TestimonialsSection'
import { services, siteInfo } from '@/data/siteData'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Floating Paws Component
function FloatingPaws() {
  const pawConfigs = [
    { left: '10%', top: '15%', duration: 4.5 },
    { left: '35%', top: '15%', duration: 5.2 },
    { left: '60%', top: '15%', duration: 4.8 },
    { left: '85%', top: '15%', duration: 5.5 },
    { left: '10%', top: '65%', duration: 5.0 },
    { left: '35%', top: '65%', duration: 4.3 },
    { left: '60%', top: '65%', duration: 5.8 },
    { left: '85%', top: '65%', duration: 4.6 },
  ]
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pawConfigs.map((paw, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: paw.left, top: paw.top }}
          animate={{
            y: [0, -30, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: paw.duration,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        >
          <PawPrint className={cn(
            "text-teal-400/20",
            i % 3 === 0 ? "w-8 h-8" : i % 3 === 1 ? "w-6 h-6" : "w-10 h-10"
          )} />
        </motion.div>
      ))}
    </div>
  )
}

// Floating Hearts Component
function FloatingHearts() {
  const heartConfigs = [
    { left: '5%', duration: 3.2 },
    { left: '23%', duration: 3.5 },
    { left: '41%', duration: 3.0 },
    { left: '59%', duration: 3.8 },
    { left: '77%', duration: 3.3 },
    { left: '95%', duration: 3.6 },
  ]
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {heartConfigs.map((heart, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: heart.left, bottom: '20%' }}
          initial={{ scale: 0, opacity: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0.8, 0],
            opacity: [0, 0.7, 0.5, 0],
            y: [0, -100, -150],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut"
          }}
        >
          <Heart className={cn(
            "fill-current",
            i % 2 === 0 ? "w-5 h-5 text-pink-400/50" : "w-4 h-4 text-teal-400/40"
          )} />
        </motion.div>
      ))}
    </div>
  )
}

// Esprili hata mesajları 🐾
const errorMessages = {
  name: {
    required: "🐾 Patili dostunuz sizi nasıl tanıtacak? Adınızı yazın!",
    minLength: "🤔 İsminiz bu kadar kısa olamaz, dostunuz tanıyamaz!",
    invalid: "👀 Hmm, bu isim biraz garip görünüyor..."
  },
  phone: {
    required: "📱 Miyav! Sizi nasıl arayalım? Telefon numaranız şart!",
    invalid: "🐕 Hav hav! Bu numara köpek dilinde yazılmış galiba, düzeltir misiniz?",
    minLength: "📞 Bu numara eksik görünüyor, patilerimizle tuşlayamıyoruz!"
  },
  petName: {
    required: "🐱 Tüylü kahramanımızın adı ne? Merak ettik!",
    minLength: "🐶 Dostunuzun ismi bu kadar kısa mı? Emin misiniz?"
  },
  service: {
    required: "🏥 Hangi hizmeti seçeceğiz? Patili dostunuz merakla bekliyor!"
  },
  date: {
    required: "📅 Ne zaman görüşelim? Dostunuz takvimini açtı bile!",
    past: "⏰ Zaman yolculuğu henüz mümkün değil, geçmiş tarih seçemezsiniz!"
  },
  time: {
    required: "⏰ Saat seçmeyi unuttunuz! Patili dostunuz saatine bakıyor..."
  }
}

type FormErrors = {
  name?: string
  phone?: string
  petName?: string
  service?: string
  date?: string
  time?: string
}

export default function RandevuPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    petName: '',
    petType: 'kedi',
    service: '',
    date: '',
    time: '',
    note: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  // Validasyon fonksiyonları
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return errorMessages.name.required
    if (name.trim().length < 3) return errorMessages.name.minLength
    if (!/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/.test(name)) return errorMessages.name.invalid
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    const cleanPhone = phone.replace(/\s/g, '')
    if (!cleanPhone) return errorMessages.phone.required
    if (cleanPhone.length < 10) return errorMessages.phone.minLength
    if (!/^(05|5)?[0-9]{9,10}$/.test(cleanPhone)) return errorMessages.phone.invalid
    return undefined
  }

  const validatePetName = (petName: string): string | undefined => {
    if (!petName.trim()) return errorMessages.petName.required
    if (petName.trim().length < 2) return errorMessages.petName.minLength
    return undefined
  }

  const validateService = (service: string): string | undefined => {
    if (!service) return errorMessages.service.required
    return undefined
  }

  const validateDate = (date: string): string | undefined => {
    if (!date) return errorMessages.date.required
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) return errorMessages.date.past
    return undefined
  }

  const validateTime = (time: string): string | undefined => {
    if (!time) return errorMessages.time.required
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateName(formData.name),
      phone: validatePhone(formData.phone),
      petName: validatePetName(formData.petName),
      service: validateService(formData.service),
      date: validateDate(formData.date),
      time: validateTime(formData.time),
    }
    
    setErrors(newErrors)
    setTouched({ name: true, phone: true, petName: true, service: true, date: true, time: true })
    
    return !Object.values(newErrors).some(error => error !== undefined)
  }

  const handleBlur = (field: string) => {
    setFocusedField(null)
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate on blur
    let error: string | undefined
    switch (field) {
      case 'name': error = validateName(formData.name); break
      case 'phone': error = validatePhone(formData.phone); break
      case 'petName': error = validatePetName(formData.petName); break
      case 'service': error = validateService(formData.service); break
      case 'date': error = validateDate(formData.date); break
      case 'time': error = validateTime(formData.time); break
    }
    
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Backend'e kaydet
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/public/appointment-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone.replace(/\s/g, ''),
          pet_name: formData.petName,
          pet_type: formData.petType === 'kedi' ? 'kedi' : 'kopek',
          service_requested: formData.service,
          preferred_date: formData.date,
          preferred_time: formData.time,
          message: formData.note || '',
          source: 'website'
        })
      })
      
      if (!response.ok) {
        console.error('Randevu kaydedilemedi')
      }
    } catch (err) {
      console.error('Randevu API hatası:', err)
    }
    
    // WhatsApp mesajı - emoji yerine ASCII karakterler kullan
    const message = `*WETNOSE - Yeni Randevu Talebi*\n\n` +
      `> Isim: ${formData.name}\n` +
      `> Telefon: ${formData.phone}\n` +
      `> Hasta Adi: ${formData.petName}\n` +
      `> Tur: ${formData.petType === 'kedi' ? 'Kedi' : 'Kopek'}\n` +
      `> Hizmet: ${formData.service}\n` +
      `> Tarih: ${formData.date}\n` +
      `> Saat: ${formData.time}\n` +
      `> Not: ${formData.note || '-'}`
    
    const whatsappUrl = `https://wa.me/${siteInfo.whatsapp}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    setIsSubmitted(true)
  }

  // Telefon numarası formatlama (05XX XXX XX XX)
  const formatPhoneNumber = (value: string): string => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '')
    
    // Maksimum 11 karakter (05XXXXXXXXX)
    const limited = numbers.slice(0, 11)
    
    // Formatlama
    if (limited.length <= 4) {
      return limited
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 4)} ${limited.slice(4)}`
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`
    } else {
      return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9)}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Telefon numarası için özel işlem
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value)
      setFormData(prev => ({
        ...prev,
        phone: formattedPhone
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }
  
  // Telefon alanında sadece rakam girişine izin ver
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // İzin verilen tuşlar: rakamlar, backspace, delete, tab, ok tuşları
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    const isNumber = /^[0-9]$/.test(e.key)
    
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />
      
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-0 left-0 w-[800px] h-[800px] bg-teal-500/15 rounded-full blur-[200px]"
            animate={{ 
              x: [0, 100, 0], 
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[180px]"
            animate={{ 
              x: [0, -80, 0], 
              y: [0, -60, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/8 rounded-full blur-[150px]"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Floating Elements */}
        <FloatingPaws />
        <FloatingHearts />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            
            {/* Left Panel - Visual & Info */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2 lg:sticky lg:top-32"
            >
              {/* Main Image Card */}
              <div className="relative rounded-3xl overflow-hidden mb-6">
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-teal-500/50 via-cyan-500/50 to-pink-500/50 rounded-3xl blur-xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative bg-gradient-to-br from-teal-500/20 to-cyan-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
                  {/* Pet Images */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/30 to-cyan-400/30 blur-2xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.img
                      src="/images/blog/1587300003388-59208cc962cb.webp"
                      alt="Mutlu Köpek"
                      className="absolute top-0 left-0 w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                    />
                    <motion.img
                      src="/images/blog/1574158622682-e40e69881006.webp"
                      alt="Mutlu Kedi"
                      className="absolute bottom-0 right-0 w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    />
                    {/* Paw Badge */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/50"
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <PawPrint className="w-7 h-7 text-white" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">Dostunuz Güvende! 🐾</h3>
                  <p className="text-gray-400">Uzman ekibimizle tanışın</p>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="space-y-4">
                {[
                  { icon: Shield, title: '7/24 Acil Hizmet', desc: 'Her an yanınızdayız', color: 'from-green-500/20 to-emerald-500/20', iconColor: 'text-green-400' },
                  { icon: MessageCircle, title: 'Hızlı WhatsApp Dönüş', desc: '30 dakika içinde', color: 'from-teal-500/20 to-cyan-500/20', iconColor: 'text-teal-400' },
                  { icon: Sparkles, title: 'Modern Teknoloji', desc: 'Son teknoloji cihazlar', color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-400' },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`bg-gradient-to-r ${feature.color} backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-default`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center ${feature.iconColor}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{feature.title}</h4>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
              >
                <p className="text-gray-400 text-sm mb-3">Hemen aramak ister misiniz?</p>
                <a 
                  href={`tel:${siteInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-lg font-semibold">{siteInfo.phone}</span>
                </a>
              </motion.div>
            </motion.div>

            {/* Right Panel - Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-3"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center lg:text-left mb-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-4 shadow-lg shadow-teal-500/20"
                >
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-semibold text-teal-300">Online Randevu</span>
                </motion.div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                  Randevu 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400"> Al</span>
                </h1>
                <p className="text-gray-400 text-lg">
                  Formu doldurun, WhatsApp üzerinden hızlıca dönüş yapalım
                </p>
              </motion.div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-teal-500/20 to-cyan-500/10 backdrop-blur-xl border border-teal-400/30 rounded-3xl p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-24 h-24 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-teal-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-4">Talebiniz Alındı! 🎉</h2>
                  <p className="text-gray-400 mb-8 text-lg">WhatsApp üzerinden en kısa sürede size dönüş yapacağız.</p>
                  <Link href="/" className="inline-flex items-center gap-2 bg-teal-500/30 hover:bg-teal-500/40 border border-teal-400/40 text-teal-300 px-8 py-4 rounded-full transition-all text-lg font-semibold">
                    Ana Sayfaya Dön
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onSubmit={handleSubmit}
                  className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10"
                >
                  {/* Form Glow Effect */}
                  <motion.div
                    className="absolute -inset-[1px] bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 rounded-3xl blur-sm -z-10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* İsim */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Adınız Soyadınız *</label>
                      <div className="relative group">
                        <motion.div
                          className={cn(
                            "absolute -inset-[1px] rounded-xl blur-sm transition-opacity",
                            errors.name && touched.name 
                              ? "bg-gradient-to-r from-red-500/50 to-orange-500/50 opacity-100"
                              : "bg-gradient-to-r from-teal-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100"
                          )}
                          animate={focusedField === 'name' && !errors.name ? { opacity: 1 } : {}}
                        />
                        <div className="relative">
                          <User className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                            errors.name && touched.name ? 'text-red-400' :
                            focusedField === 'name' ? 'text-teal-400' : 'text-gray-500'
                          )} />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => handleBlur('name')}
                            className={cn(
                              "w-full bg-black/40 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:bg-black/60 transition-all",
                              errors.name && touched.name 
                                ? "border-2 border-red-400/50" 
                                : "border border-white/10 focus:border-teal-400/50"
                            )}
                            placeholder="Adınız Soyadınız"
                          />
                        </div>
                      </div>
                      <AnimatePresence>
                        {errors.name && touched.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="text-red-400 text-sm mt-2 flex items-start gap-2"
                          >
                            <span>{errors.name}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Telefon */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Telefon Numaranız *</label>
                      <div className="relative group">
                        <motion.div
                          className={cn(
                            "absolute -inset-[1px] rounded-xl blur-sm transition-opacity",
                            errors.phone && touched.phone 
                              ? "bg-gradient-to-r from-red-500/50 to-orange-500/50 opacity-100"
                              : "bg-gradient-to-r from-teal-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100"
                          )}
                          animate={focusedField === 'phone' && !errors.phone ? { opacity: 1 } : {}}
                        />
                        <div className="relative">
                          <Phone className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                            errors.phone && touched.phone ? 'text-red-400' :
                            focusedField === 'phone' ? 'text-teal-400' : 'text-gray-500'
                          )} />
                          <input
                            type="tel"
                            name="phone"
                            inputMode="numeric"
                            value={formData.phone}
                            onChange={handleChange}
                            onKeyDown={handlePhoneKeyDown}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => handleBlur('phone')}
                            className={cn(
                              "w-full bg-black/40 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:bg-black/60 transition-all",
                              errors.phone && touched.phone 
                                ? "border-2 border-red-400/50" 
                                : "border border-white/10 focus:border-teal-400/50"
                            )}
                            placeholder="05XX XXX XX XX"
                            maxLength={14}
                          />
                        </div>
                      </div>
                      <AnimatePresence>
                        {errors.phone && touched.phone && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="text-red-400 text-sm mt-2 flex items-start gap-2"
                          >
                            <span>{errors.phone}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Hasta Adı */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Dostunuzun Adı *</label>
                      <div className="relative group">
                        <motion.div
                          className={cn(
                            "absolute -inset-[1px] rounded-xl blur-sm transition-opacity",
                            errors.petName && touched.petName 
                              ? "bg-gradient-to-r from-red-500/50 to-orange-500/50 opacity-100"
                              : "bg-gradient-to-r from-teal-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100"
                          )}
                          animate={focusedField === 'petName' && !errors.petName ? { opacity: 1 } : {}}
                        />
                        <div className="relative">
                          <PawPrint className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                            errors.petName && touched.petName ? 'text-red-400' :
                            focusedField === 'petName' ? 'text-teal-400' : 'text-gray-500'
                          )} />
                          <input
                            type="text"
                            name="petName"
                            value={formData.petName}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('petName')}
                            onBlur={() => handleBlur('petName')}
                            className={cn(
                              "w-full bg-black/40 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:bg-black/60 transition-all",
                              errors.petName && touched.petName 
                                ? "border-2 border-red-400/50" 
                                : "border border-white/10 focus:border-teal-400/50"
                            )}
                            placeholder="Dostunuzun adı"
                          />
                        </div>
                      </div>
                      <AnimatePresence>
                        {errors.petName && touched.petName && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="text-red-400 text-sm mt-2 flex items-start gap-2"
                          >
                            <span>{errors.petName}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Tür */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Tür *</label>
                      <div className="flex gap-4">
                        {['kedi', 'kopek'].map((type) => (
                          <motion.button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, petType: type }))}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "flex-1 py-4 px-4 rounded-xl border transition-all flex items-center justify-center gap-3 font-medium",
                              formData.petType === type
                                ? 'bg-gradient-to-r from-teal-500/30 to-cyan-500/30 border-teal-400/50 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:bg-black/50'
                            )}
                          >
                            <motion.span 
                              className="text-2xl"
                              animate={formData.petType === type ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              {type === 'kedi' ? '🐱' : '🐕'}
                            </motion.span>
                            {type === 'kedi' ? 'Kedi' : 'Köpek'}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Hizmet */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Hizmet *</label>
                      <div className="relative group">
                        <motion.div
                          className={cn(
                            "absolute -inset-[1px] rounded-xl blur-sm transition-opacity",
                            errors.service && touched.service 
                              ? "bg-gradient-to-r from-red-500/50 to-orange-500/50 opacity-100"
                              : "bg-gradient-to-r from-teal-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100"
                          )}
                          animate={focusedField === 'service' && !errors.service ? { opacity: 1 } : {}}
                        />
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('service')}
                          onBlur={() => handleBlur('service')}
                          className={cn(
                            "relative w-full bg-black/40 rounded-xl px-4 py-4 text-white focus:outline-none focus:bg-black/60 transition-all appearance-none cursor-pointer",
                            errors.service && touched.service 
                              ? "border-2 border-red-400/50" 
                              : "border border-white/10 focus:border-teal-400/50"
                          )}
                        >
                          <option value="" className="bg-gray-900">Hizmet seçin</option>
                          {services.map(service => (
                            <option key={service.id} value={service.title} className="bg-gray-900">
                              {service.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <AnimatePresence>
                        {errors.service && touched.service && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="text-red-400 text-sm mt-2 flex items-start gap-2"
                          >
                            <span>{errors.service}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Tarih */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Tarih *</label>
                      <div className="relative group">
                        <motion.div
                          className={cn(
                            "absolute -inset-[1px] rounded-xl blur-sm transition-opacity",
                            errors.date && touched.date 
                              ? "bg-gradient-to-r from-red-500/50 to-orange-500/50 opacity-100"
                              : "bg-gradient-to-r from-teal-500/50 to-cyan-500/50 opacity-0 group-hover:opacity-100"
                          )}
                          animate={focusedField === 'date' && !errors.date ? { opacity: 1 } : {}}
                        />
                        <div className="relative">
                          <Calendar className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                            errors.date && touched.date ? 'text-red-400' :
                            focusedField === 'date' ? 'text-teal-400' : 'text-gray-500'
                          )} />
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('date')}
                            onBlur={() => handleBlur('date')}
                            min={new Date().toISOString().split('T')[0]}
                            className={cn(
                              "w-full bg-black/40 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:bg-black/60 transition-all",
                              errors.date && touched.date 
                                ? "border-2 border-red-400/50" 
                                : "border border-white/10 focus:border-teal-400/50"
                            )}
                          />
                        </div>
                      </div>
                      <AnimatePresence>
                        {errors.date && touched.date && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="text-red-400 text-sm mt-2 flex items-start gap-2"
                          >
                            <span>{errors.date}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Saat */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-3">Tercih Ettiğiniz Saat *</label>
                      <div className={cn(
                        "grid grid-cols-4 sm:grid-cols-8 gap-2 p-1 rounded-xl",
                        errors.time && touched.time ? "ring-2 ring-red-400/50" : ""
                      )}>
                        {timeSlots.map((time) => (
                          <motion.button
                            key={time}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, time }))
                              setErrors(prev => ({ ...prev, time: undefined }))
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "py-3 px-3 rounded-xl text-sm font-medium transition-all",
                              formData.time === time
                                ? 'bg-gradient-to-r from-teal-500/50 to-cyan-500/50 border border-teal-400/50 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-black/40 border border-white/10 text-gray-400 hover:border-teal-400/30 hover:text-white'
                            )}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                      <AnimatePresence>
                        {errors.time && touched.time && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="text-red-400 text-sm mt-2 flex items-start gap-2"
                          >
                            <span>{errors.time}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Not */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Eklemek İstedikleriniz</label>
                      <div className="relative group">
                        <motion.div
                          className="absolute -inset-[1px] bg-gradient-to-r from-teal-500/50 to-cyan-500/50 rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity"
                          animate={focusedField === 'note' ? { opacity: 1 } : {}}
                        />
                        <textarea
                          name="note"
                          value={formData.note}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('note')}
                          onBlur={() => setFocusedField(null)}
                          rows={3}
                          className="relative w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:border-teal-400/50 focus:outline-none focus:bg-black/60 transition-all resize-none"
                          placeholder="Şikayetler, özel durumlar..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(20, 184, 166, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full mt-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-teal-500/30 overflow-hidden group"
                  >
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <Send className="w-5 h-5 relative z-10" />
                    <span className="relative z-10 text-lg">WhatsApp ile Randevu Al</span>
                  </motion.button>

                  <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Form WhatsApp üzerinden gönderilecektir
                  </p>
                </motion.form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Patili Dostlarımız Ne Dedi Section */}
      <TestimonialsSection />

      <Footer />
    </main>
  )
}

