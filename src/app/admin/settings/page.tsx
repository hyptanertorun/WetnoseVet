'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, Save, Phone, Mail, MapPin, Clock, Globe,
  AlertCircle, Check, X, Loader2
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { useAuthStore } from '@/lib/adminAuth'
import { cn } from '@/lib/utils'

interface ClinicSettings {
  clinic_name: string
  phone: string
  whatsapp: string
  emergency_phone: string
  email: string
  address: string
  city: string
  district: string
  facebook_url: string | null
  instagram_url: string | null
  twitter_url: string | null
  youtube_url: string | null
  pinterest_url: string | null
  tiktok_url: string | null
  is_24_7_emergency: boolean
  kvkk_text: string | null
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<ClinicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<ClinicSettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const response = await adminApi.getSettings()
    if (response.data) {
      const s = {
        clinic_name: response.data.clinic_name,
        phone: response.data.phone,
        whatsapp: response.data.whatsapp,
        emergency_phone: response.data.emergency_phone,
        email: response.data.email,
        address: response.data.address,
        city: response.data.city,
        district: response.data.district,
        facebook_url: response.data.facebook_url,
        instagram_url: response.data.instagram_url,
        twitter_url: response.data.twitter_url,
        youtube_url: response.data.youtube_url,
        pinterest_url: response.data.pinterest_url,
        tiktok_url: response.data.tiktok_url,
        is_24_7_emergency: response.data.is_24_7_emergency,
        kvkk_text: response.data.kvkk_text,
      }
      setSettings(s)
      setOriginalSettings(s)
    }
    setLoading(false)
  }

  const handleChange = (field: keyof ClinicSettings, value: string | boolean) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    
    const response = await adminApi.updateSettings(settings)
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi' })
      setHasChanges(false)
      setOriginalSettings(settings)
    }
    setSaving(false)
  }

  const handleReset = () => {
    if (originalSettings) {
      setSettings(originalSettings)
      setHasChanges(false)
    }
  }

  // Check permissions
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-3',
              message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'
            )}
          >
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
            <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-teal-400" />
            Klinik Ayarları
          </h1>
          <p className="text-gray-400 mt-1">Klinik iletişim ve genel bilgilerini yönetin</p>
        </div>
        
        {canEdit && hasChanges && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Kaydet
            </button>
          </div>
        )}
      </div>

      {settings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal-400" />
              İletişim Bilgileri
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Klinik Adı</label>
                <input
                  type="text"
                  value={settings.clinic_name}
                  onChange={(e) => handleChange('clinic_name', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!canEdit}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={settings.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    disabled={!canEdit}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                    placeholder="905xxxxxxxxx"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <span className="text-red-400">🚨</span> Acil Hat Numarası
                </label>
                <input
                  type="tel"
                  value={settings.emergency_phone}
                  onChange={(e) => handleChange('emergency_phone', e.target.value)}
                  disabled={!canEdit}
                  placeholder="05XX XXX XX XX"
                  className="w-full bg-gray-800 border border-red-500/30 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Ana sayfadaki Acil Hat bölümünde görüntülenecek numara</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-400" />
              Adres Bilgileri
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Adres</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!canEdit}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">İl</label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    disabled={!canEdit}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">İlçe</label>
                  <input
                    type="text"
                    value={settings.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    disabled={!canEdit}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-400" />
              Sosyal Medya
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Facebook URL</label>
                <input
                  type="url"
                  value={settings.facebook_url || ''}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={settings.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Twitter / X URL</label>
                <input
                  type="url"
                  value={settings.twitter_url || ''}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://twitter.com/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={settings.youtube_url || ''}
                  onChange={(e) => handleChange('youtube_url', e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://www.youtube.com/@wetnose"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Örn: https://www.youtube.com/@wetnose</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pinterest URL</label>
                <input
                  type="url"
                  value={settings.pinterest_url || ''}
                  onChange={(e) => handleChange('pinterest_url', e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://www.pinterest.com/wetnose/"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Örn: https://www.pinterest.com/wetnose/</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">TikTok URL</label>
                <input
                  type="url"
                  value={settings.tiktok_url || ''}
                  onChange={(e) => handleChange('tiktok_url', e.target.value)}
                  disabled={!canEdit}
                  placeholder="https://www.tiktok.com/@wetnose"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </motion.div>

          {/* Emergency & Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              Acil & Yasal
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">7/24 Acil Hizmet</p>
                  <p className="text-sm text-gray-400">Acil veteriner hizmeti aktif mi?</p>
                </div>
                <button
                  onClick={() => canEdit && handleChange('is_24_7_emergency', !settings.is_24_7_emergency)}
                  disabled={!canEdit}
                  className={cn(
                    'w-14 h-8 rounded-full transition-colors relative',
                    settings.is_24_7_emergency ? 'bg-teal-500' : 'bg-gray-600',
                    !canEdit && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'absolute top-1 w-6 h-6 bg-white rounded-full transition-transform',
                    settings.is_24_7_emergency ? 'left-7' : 'left-1'
                  )} />
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">KVKK Metni</label>
                <textarea
                  value={settings.kvkk_text || ''}
                  onChange={(e) => handleChange('kvkk_text', e.target.value)}
                  disabled={!canEdit}
                  rows={4}
                  placeholder="Kişisel verilerin korunması hakkında bilgilendirme metni..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
