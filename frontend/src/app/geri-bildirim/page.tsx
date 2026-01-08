'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, Upload, CheckCircle2, AlertCircle, Send, 
  PawPrint, Heart, Camera, X, Loader2
} from 'lucide-react'

// API URL - uses window.location.origin for client-side requests
function getApiUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

interface Service {
  id: string
  title: string
}

type FeedbackType = 'positive' | 'neutral' | 'negative'

function GeriBildirimForm() {
  const searchParams = useSearchParams()
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [petName, setPetName] = useState(searchParams.get('pet_name') || '')
  const [petPhotoFile, setPetPhotoFile] = useState<File | null>(null)
  const [petPhotoPreview, setPetPhotoPreview] = useState<string | null>(null)
  const [petPhotoUrl, setPetPhotoUrl] = useState<string | null>(null) // Server URL after upload
  const [serviceId, setServiceId] = useState(searchParams.get('service_id') || '')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('positive')
  const [comment, setComment] = useState('')
  const [consentInternal, setConsentInternal] = useState(false)
  const [consentPublic, setConsentPublic] = useState(false)
  const [wantsCallback, setWantsCallback] = useState(false)
  
  // UI state
  const [services, setServices] = useState<Service[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState('') // Separate error for image
  const [success, setSuccess] = useState(false)
  
  // Honeypot field (hidden from users)
  const [honeypot, setHoneypot] = useState('')
  
  // Load services for dropdown
  useEffect(() => {
    const apiUrl = getApiUrl()
    if (!apiUrl) return
    fetch(`${apiUrl}/api/public/services-list`)
      .then(res => res.json())
      .then(data => setServices(data.services || []))
      .catch(console.error)
  }, [])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (petPhotoPreview) {
        URL.revokeObjectURL(petPhotoPreview)
      }
    }
  }, [petPhotoPreview])
  
  // Handle image selection - local preview first, then optional upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Clear previous errors
    setImageError('')
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setImageError('Lütfen JPG, PNG veya WebP formatında bir görsel seçin')
      return
    }
    
    // Validate file size (5MB - more generous)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Dosya boyutu 5MB\'dan küçük olmalı')
      return
    }
    
    // Create local preview immediately
    const previewUrl = URL.createObjectURL(file)
    setPetPhotoFile(file)
    setPetPhotoPreview(previewUrl)
    
    // Try to upload to server (optional - form can still submit without this)
    setIsUploading(true)
    try {
      const apiUrl = getApiUrl()
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch(`${apiUrl}/api/public/feedback/upload-image`, {
        method: 'POST',
        body: formData
      })
      
      if (res.ok) {
        const data = await res.json()
        setPetPhotoUrl(data.url)
      }
      // If upload fails, we still have local preview - form can submit
    } catch {
      // Silent fail - we have local preview
    } finally {
      setIsUploading(false)
    }
  }
  
  // Remove image
  const removeImage = () => {
    if (petPhotoPreview) {
      URL.revokeObjectURL(petPhotoPreview)
    }
    setPetPhotoFile(null)
    setPetPhotoPreview(null)
    setPetPhotoUrl(null)
    setImageError('')
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!fullName.trim()) {
      setError('Lütfen adınızı girin')
      return
    }
    if (!petName.trim()) {
      setError('Lütfen evcil hayvanınızın adını girin')
      return
    }
    if (rating === 0) {
      setError('Lütfen bir puan verin')
      return
    }
    if (!comment.trim() || comment.length < 10) {
      setError('Lütfen en az 10 karakterlik bir yorum yazın')
      return
    }
    if (!consentInternal) {
      setError('Devam etmek için geri bildirim izni vermeniz gerekiyor')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/api/public/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          pet_name: petName.trim(),
          pet_photo_url: petPhotoUrl, // Server URL if uploaded, null otherwise
          service_id: serviceId || null,
          rating,
          feedback_type: feedbackType,
          comment: comment.trim(),
          consent_internal: consentInternal,
          consent_public: consentPublic,
          honeypot
        })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Geri bildirim gönderilemedi')
      }
      
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 mb-6"
          >
            <Heart className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Teşekkürler! 🐾
          </h1>
          
          <p className="text-gray-400 text-lg mb-6">
            Geri bildiriminiz başarıyla alındı. Değerlendirmeniz bizim için çok değerli.
          </p>
          
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold"
          >
            <PawPrint className="w-5 h-5" />
            Ana Sayfaya Dön
          </motion.a>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Trust Badge - Üst Güven Unsuru */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20">
            <Heart className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-teal-300">Geri bildiriminiz hizmet kalitemizi iyileştirir</span>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 mb-4">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Ne kadar memnun edebildik?
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Patili dostunuzun ve sizin deneyiminiz bizim için çok değerli. 
            Birkaç dakikanızı ayırarak bize yardımcı olun. 💙
          </p>
        </motion.div>
        
        {/* Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Honeypot - hidden from users */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ position: 'absolute', left: '-9999px' }}
            tabIndex={-1}
            autoComplete="off"
          />
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Adınız Soyadınız *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
              placeholder="Adınız Soyadınız"
              required
            />
          </div>
          
          {/* Email & Phone (optional) */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-posta <span className="text-gray-500">(İsteğe bağlı)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefon <span className="text-gray-500">(İsteğe bağlı)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="05XX XXX XX XX"
              />
            </div>
          </div>
          
          {/* Pet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Evcil Hayvanınızın Adı *
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
              placeholder="Örn: Pamuk"
              required
            />
          </div>
          
          {/* Pet Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Evcil Hayvanınızın Fotoğrafı <span className="text-gray-500">(İsteğe bağlı)</span>
            </label>
            
            {petPhotoPreview ? (
              <div className="relative inline-block">
                <img
                  src={petPhotoPreview}
                  alt="Pet preview"
                  className="w-32 h-32 object-cover rounded-xl border-2 border-teal-500/30"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-gray-800/30 transition-all">
                <Camera className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-sm text-gray-500">Fotoğraf ekle</span>
                <span className="text-xs text-gray-600 mt-1">JPG, PNG, WebP - Max 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
            
            {/* Image error message - soft, not alarming */}
            {imageError && (
              <p className="mt-2 text-sm text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {imageError}
              </p>
            )}
            
            {/* Helper text - reduces stress */}
            <p className="mt-2 text-xs text-gray-500">
              📸 Fotoğraf eklemek zorunlu değildir. Form fotoğrafsız da gönderilebilir.
            </p>
          </div>
          
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aldığınız Hizmet <span className="text-gray-500">(İsteğe bağlı)</span>
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none transition-colors"
            >
              <option value="">Hizmet seçin...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Puanınız *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Genel Değerlendirme *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'positive', label: 'Olumlu', emoji: '😊' },
                { value: 'neutral', label: 'Nötr', emoji: '😐' },
                { value: 'negative', label: 'Olumsuz', emoji: '😔' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFeedbackType(type.value as FeedbackType)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    feedbackType === type.value
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{type.emoji}</span>
                  <span className={`text-sm ${feedbackType === type.value ? 'text-teal-400' : 'text-gray-400'}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Yorumunuz *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors resize-none"
              placeholder="Deneyiminizi paylaşın..."
              required
              minLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">En az 10 karakter</p>
          </div>
          
          {/* Consent Checkboxes */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentInternal}
                onChange={(e) => setConsentInternal(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-gray-900"
              />
              <span className="text-sm text-gray-400 group-hover:text-gray-300">
                Geri bildirimimin değerlendirilmesine izin veriyorum. *
                <span className="block text-xs text-gray-500 mt-1">
                  KVKK kapsamında verileriniz gizlilik politikamız çerçevesinde işlenecektir.
                </span>
              </span>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentPublic}
                onChange={(e) => setConsentPublic(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-gray-900"
              />
              <span className="text-sm text-gray-400 group-hover:text-gray-300">
                Geri bildirimimin web sitesinde paylaşılmasına izin veriyorum.
                <span className="block text-xs text-gray-500 mt-1">
                  Onay verirseniz, yorumunuz klinik incelemesi sonrası web sitemizde görüntülenebilir.
                </span>
              </span>
            </label>

            {/* Neuro-Marketing CTA - Callback Request */}
            <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl bg-gradient-to-r from-teal-500/5 to-cyan-500/5 border border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <input
                type="checkbox"
                checked={wantsCallback}
                onChange={(e) => setWantsCallback(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-teal-600 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-gray-900"
              />
              <span className="text-sm text-teal-300 group-hover:text-teal-200">
                ✨ Uzmanımız beni arayıp detaylı dinleyebilir
                <span className="block text-xs text-gray-400 mt-1">
                  İsterseniz veteriner ekibimiz sizi arayarak geri bildiriminizi daha detaylı dinleyebilir.
                </span>
              </span>
            </label>
          </div>
          
          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Görüşümü Paylaş
              </>
            )}
          </motion.button>
        </motion.form>
        
        {/* Footer note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          <a href="/" className="text-teal-400 hover:text-teal-300 transition-colors">
            ← Ana Sayfaya Dön
          </a>
        </p>
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function FormLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Yükleniyor...</p>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function GeriBildirimPage() {
  return (
    <Suspense fallback={<FormLoading />}>
      <GeriBildirimForm />
    </Suspense>
  )
}
