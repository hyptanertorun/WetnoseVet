'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Plus, Trash2, Edit, Eye, EyeOff, GripVertical, Settings2, 
  Image as ImageIcon, Type, MousePointer2, Layers, Save, X, 
  Play, Pause, ChevronDown, ChevronUp, Sparkles, BarChart3,
  Link2, Clock, Loader2, Check, AlertCircle
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import ImageUploadCropper from '@/components/admin/ImageUploadCropper'

interface SlideButton {
  id?: string
  text: string
  href: string
  style: string
  icon?: string | null
  is_visible: boolean
}

interface SlideOverlay {
  enabled: boolean
  opacity: number
  gradient_direction: string
  color: string
}

interface Slide {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  image_alt: string | null
  mobile_image_url: string | null
  buttons: SlideButton[]
  overlay: SlideOverlay
  is_active: boolean
  sort_order: number
  animation_duration: number
  created_at: string
  updated_at: string
}

interface SliderSettings {
  id: string
  auto_play: boolean
  auto_play_interval: number
  show_navigation_arrows: boolean
  show_navigation_dots: boolean
  show_progress_bar: boolean
  show_slide_counter: boolean
  show_scroll_indicator: boolean
  badge: {
    enabled: boolean
    text: string
    icon: string
    show_pulse: boolean
  }
  stats: {
    enabled: boolean
    items: Array<{ value: string; label: string }>
  }
  ken_burns_effect: boolean
  scan_line_effect: boolean
}

const BUTTON_STYLES = [
  { value: 'primary', label: 'Ana Buton', color: 'bg-teal-500' },
  { value: 'secondary', label: 'İkincil', color: 'bg-white/10 border' },
  { value: 'outline', label: 'Çerçeveli', color: 'border-2 border-white' },
]

const BUTTON_ICONS = [
  { value: '', label: 'İkon Yok' },
  { value: 'calendar', label: 'Takvim' },
  { value: 'play', label: 'Oynat' },
  { value: 'arrow-right', label: 'Ok' },
  { value: 'phone', label: 'Telefon' },
  { value: 'users', label: 'Kullanıcılar' },
  { value: 'stethoscope', label: 'Steteskop' },
]

export default function SliderManagementPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [settings, setSettings] = useState<SliderSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Modal states
  const [showSlideModal, setShowSlideModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  
  // Form state
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    image_alt: '',
    mobile_image_url: '',
    buttons: [] as SlideButton[],
    overlay: {
      enabled: true,
      opacity: 50,
      gradient_direction: 'to-r',
      color: '#000000'
    },
    is_active: true,
    animation_duration: 6000
  })
  
  // Settings form
  const [settingsForm, setSettingsForm] = useState<SliderSettings | null>(null)
  
  // Active tab in modal
  const [activeTab, setActiveTab] = useState<'content' | 'buttons' | 'overlay' | 'settings'>('content')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [slidesRes, settingsRes] = await Promise.all([
        adminApi.getSlides(true),
        adminApi.getSliderSettings()
      ])
      
      if (slidesRes.data) {
        setSlides(slidesRes.data.slides)
      }
      if (settingsRes.data) {
        setSettings(settingsRes.data)
        setSettingsForm(settingsRes.data)
      }
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const showMessage = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccess(message)
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(message)
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleCreateSlide = () => {
    setEditingSlide(null)
    setSlideForm({
      title: '',
      subtitle: '',
      image_url: '',
      image_alt: '',
      mobile_image_url: '',
      buttons: [
        { text: 'Online Randevu Al', href: '/randevu', style: 'primary', icon: 'calendar', is_visible: true },
        { text: 'Keşfet', href: '#services', style: 'secondary', icon: 'play', is_visible: true }
      ],
      overlay: { enabled: true, opacity: 50, gradient_direction: 'to-r', color: '#000000' },
      is_active: true,
      animation_duration: 6000
    })
    setActiveTab('content')
    setShowSlideModal(true)
  }

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide)
    setSlideForm({
      title: slide.title,
      subtitle: slide.subtitle || '',
      image_url: slide.image_url,
      image_alt: slide.image_alt || '',
      mobile_image_url: slide.mobile_image_url || '',
      buttons: slide.buttons.map(b => ({ ...b })),
      overlay: { ...slide.overlay },
      is_active: slide.is_active,
      animation_duration: slide.animation_duration
    })
    setActiveTab('content')
    setShowSlideModal(true)
  }

  const handleSaveSlide = async () => {
    if (!slideForm.title || !slideForm.image_url) {
      showMessage('error', 'Başlık ve görsel zorunludur')
      return
    }
    
    setSaving(true)
    try {
      const data = {
        title: slideForm.title,
        subtitle: slideForm.subtitle || undefined,
        image_url: slideForm.image_url,
        image_alt: slideForm.image_alt || undefined,
        mobile_image_url: slideForm.mobile_image_url || undefined,
        buttons: slideForm.buttons.map(b => ({
          text: b.text,
          href: b.href,
          style: b.style,
          icon: b.icon || undefined,
          is_visible: b.is_visible
        })),
        overlay: slideForm.overlay,
        is_active: slideForm.is_active,
        animation_duration: slideForm.animation_duration
      }
      
      if (editingSlide) {
        await adminApi.updateSlide(editingSlide.id, data)
        showMessage('success', 'Slide güncellendi')
      } else {
        await adminApi.createSlide(data)
        showMessage('success', 'Yeni slide oluşturuldu')
      }
      
      setShowSlideModal(false)
      fetchData()
    } catch (err) {
      showMessage('error', 'Kaydetme başarısız')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm('Bu slide\'ı silmek istediğinize emin misiniz?')) return
    
    try {
      await adminApi.deleteSlide(slideId)
      showMessage('success', 'Slide silindi')
      fetchData()
    } catch (err) {
      showMessage('error', 'Silme başarısız')
    }
  }

  const handleToggleActive = async (slide: Slide) => {
    try {
      await adminApi.updateSlide(slide.id, { is_active: !slide.is_active })
      showMessage('success', slide.is_active ? 'Slide pasif yapıldı' : 'Slide aktif yapıldı')
      fetchData()
    } catch (err) {
      showMessage('error', 'Güncelleme başarısız')
    }
  }

  const handleReorder = async (newOrder: Slide[]) => {
    setSlides(newOrder)
    try {
      const items = newOrder.map((slide, index) => ({
        id: slide.id,
        sort_order: index
      }))
      await adminApi.reorderSlides(items)
    } catch (err) {
      showMessage('error', 'Sıralama güncellenemedi')
      fetchData()
    }
  }

  const handleSaveSettings = async () => {
    if (!settingsForm) return
    
    setSaving(true)
    try {
      await adminApi.updateSliderSettings({
        auto_play: settingsForm.auto_play,
        auto_play_interval: settingsForm.auto_play_interval,
        show_navigation_arrows: settingsForm.show_navigation_arrows,
        show_navigation_dots: settingsForm.show_navigation_dots,
        show_progress_bar: settingsForm.show_progress_bar,
        show_slide_counter: settingsForm.show_slide_counter,
        show_scroll_indicator: settingsForm.show_scroll_indicator,
        badge: settingsForm.badge,
        stats: settingsForm.stats,
        ken_burns_effect: settingsForm.ken_burns_effect,
        scan_line_effect: settingsForm.scan_line_effect
      })
      showMessage('success', 'Ayarlar kaydedildi')
      setShowSettingsModal(false)
      fetchData()
    } catch (err) {
      showMessage('error', 'Ayarlar kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const addButton = () => {
    setSlideForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, { text: '', href: '', style: 'primary', icon: '', is_visible: true }]
    }))
  }

  const removeButton = (index: number) => {
    setSlideForm(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }))
  }

  const updateButton = (index: number, field: string, value: string | boolean) => {
    setSlideForm(prev => ({
      ...prev,
      buttons: prev.buttons.map((b, i) => i === index ? { ...b, [field]: value } : b)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-teal-400" />
            Slider Yönetimi
          </h1>
          <p className="text-gray-400 mt-1">Anasayfa hero slider içeriklerini yönetin</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Ayarlar
          </button>
          <button
            onClick={handleCreateSlide}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Yeni Slide
          </button>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-lg flex items-center gap-3",
              success ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}
          >
            {success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{success || error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <Layers className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{slides.length}</p>
              <p className="text-sm text-gray-400">Toplam Slide</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{slides.filter(s => s.is_active).length}</p>
              <p className="text-sm text-gray-400">Aktif Slide</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              {settings?.auto_play ? <Play className="w-5 h-5 text-purple-400" /> : <Pause className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{settings?.auto_play ? 'Açık' : 'Kapalı'}</p>
              <p className="text-sm text-gray-400">Otomatik Oynatma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slides List */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white">Slide Listesi</h2>
          <p className="text-sm text-gray-400">Sürükle-bırak ile sıralayın</p>
        </div>
        
        {slides.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Henüz slide yok</h3>
            <p className="text-gray-500 mb-4">İlk slide&apos;ınızı oluşturarak başlayın</p>
            <button
              onClick={handleCreateSlide}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Slide Oluştur
            </button>
          </div>
        ) : (
          <Reorder.Group axis="y" values={slides} onReorder={handleReorder} className="divide-y divide-gray-700/50">
            {slides.map((slide) => (
              <Reorder.Item
                key={slide.id}
                value={slide}
                className="p-4 hover:bg-gray-800/30 transition-colors cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-4">
                  <div className="text-gray-500 hover:text-gray-300">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    {slide.image_url ? (
                      <Image
                        src={slide.image_url}
                        alt={slide.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    {!slide.is_active && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <EyeOff className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{slide.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{slide.subtitle || 'Alt başlık yok'}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
                        slide.is_active 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-gray-500/20 text-gray-400"
                      )}>
                        {slide.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {slide.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {slide.buttons.length} buton
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {(slide.animation_duration / 1000).toFixed(0)}s
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        slide.is_active 
                          ? "text-green-400 hover:bg-green-500/20" 
                          : "text-gray-400 hover:bg-gray-700"
                      )}
                      title={slide.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                    >
                      {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEditSlide(slide)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Slide Modal */}
      <AnimatePresence>
        {showSlideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSlideModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingSlide ? 'Slide Düzenle' : 'Yeni Slide'}
                </h2>
                <button
                  onClick={() => setShowSlideModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { id: 'content', label: 'İçerik', icon: Type },
                  { id: 'buttons', label: 'Butonlar', icon: MousePointer2 },
                  { id: 'overlay', label: 'Overlay', icon: Layers },
                  { id: 'settings', label: 'Ayarlar', icon: Settings2 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "text-teal-400 border-b-2 border-teal-400 bg-teal-500/5"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Content Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Başlık *</label>
                      <input
                        type="text"
                        value={slideForm.title}
                        onChange={(e) => setSlideForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                        placeholder="Slide başlığı..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Alt Başlık</label>
                      <input
                        type="text"
                        value={slideForm.subtitle}
                        onChange={(e) => setSlideForm(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                        placeholder="Alt başlık..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Görsel *</label>
                      <ImageUploadCropper
                        value={slideForm.image_url}
                        onChange={(url) => setSlideForm(prev => ({ ...prev, image_url: url }))}
                        aspectPreset="16:9"
                        uploadContext="slider"
                        hideAI
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Alt Metin (SEO)</label>
                      <input
                        type="text"
                        value={slideForm.image_alt}
                        onChange={(e) => setSlideForm(prev => ({ ...prev, image_alt: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                        placeholder="Görsel açıklaması..."
                      />
                    </div>
                  </div>
                )}
                
                {/* Buttons Tab */}
                {activeTab === 'buttons' && (
                  <div className="space-y-4">
                    {slideForm.buttons.map((button, index) => (
                      <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">Buton {index + 1}</span>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={button.is_visible}
                                onChange={(e) => updateButton(index, 'is_visible', e.target.checked)}
                                className="rounded border-gray-600"
                              />
                              <span className="text-xs text-gray-400">Görünür</span>
                            </label>
                            <button
                              onClick={() => removeButton(index)}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Metin</label>
                            <input
                              type="text"
                              value={button.text}
                              onChange={(e) => updateButton(index, 'text', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                              placeholder="Buton metni..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Link</label>
                            <input
                              type="text"
                              value={button.href}
                              onChange={(e) => updateButton(index, 'href', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                              placeholder="/randevu"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Stil</label>
                            <select
                              value={button.style}
                              onChange={(e) => updateButton(index, 'style', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                            >
                              {BUTTON_STYLES.map(style => (
                                <option key={style.value} value={style.value}>{style.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">İkon</label>
                            <select
                              value={button.icon || ''}
                              onChange={(e) => updateButton(index, 'icon', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                            >
                              {BUTTON_ICONS.map(icon => (
                                <option key={icon.value} value={icon.value}>{icon.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={addButton}
                      className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-teal-500 hover:text-teal-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Buton Ekle
                    </button>
                  </div>
                )}
                
                {/* Overlay Tab */}
                {activeTab === 'overlay' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">Overlay Etkin</h3>
                        <p className="text-sm text-gray-400">Görsel üzerinde karartma efekti</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slideForm.overlay.enabled}
                          onChange={(e) => setSlideForm(prev => ({ 
                            ...prev, 
                            overlay: { ...prev.overlay, enabled: e.target.checked } 
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Opaklık: {slideForm.overlay.opacity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={slideForm.overlay.opacity}
                        onChange={(e) => setSlideForm(prev => ({ 
                          ...prev, 
                          overlay: { ...prev.overlay, opacity: parseInt(e.target.value) } 
                        }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Hafif</span>
                        <span>Koyu</span>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="relative h-40 rounded-xl overflow-hidden bg-gray-700">
                      {slideForm.image_url && (
                        <>
                          <Image
                            src={slideForm.image_url}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          {slideForm.overlay.enabled && (
                            <div 
                              className="absolute inset-0" 
                              style={{ backgroundColor: `rgba(0,0,0,${slideForm.overlay.opacity / 100})` }}
                            />
                          )}
                          <div className="absolute bottom-4 left-4 text-white">
                            <h4 className="font-bold">{slideForm.title || 'Başlık'}</h4>
                            <p className="text-sm opacity-80">{slideForm.subtitle || 'Alt başlık'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">Aktif</h3>
                        <p className="text-sm text-gray-400">Slide görünür olsun mu?</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slideForm.is_active}
                          onChange={(e) => setSlideForm(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Görünme Süresi: {(slideForm.animation_duration / 1000).toFixed(1)} saniye
                      </label>
                      <input
                        type="range"
                        min="3000"
                        max="15000"
                        step="1000"
                        value={slideForm.animation_duration}
                        onChange={(e) => setSlideForm(prev => ({ ...prev, animation_duration: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>3s</span>
                        <span>15s</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSlideModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveSlide}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingSlide ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && settingsForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-teal-400" />
                  Slider Ayarları
                </h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Autoplay Section */}
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Otomatik Oynatma</h3>
                      <p className="text-sm text-gray-400">Slide&apos;lar otomatik geçsin mi?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.auto_play}
                        onChange={(e) => setSettingsForm(prev => prev ? { ...prev, auto_play: e.target.checked } : null)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                  
                  {settingsForm.auto_play && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Geçiş Süresi: {(settingsForm.auto_play_interval / 1000).toFixed(0)} saniye
                      </label>
                      <input
                        type="range"
                        min="3000"
                        max="15000"
                        step="1000"
                        value={settingsForm.auto_play_interval}
                        onChange={(e) => setSettingsForm(prev => prev ? { ...prev, auto_play_interval: parseInt(e.target.value) } : null)}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>
                  )}
                </div>
                
                {/* Navigation Section */}
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                  <h3 className="font-medium text-white mb-4">Navigasyon Elemanları</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'show_navigation_arrows', label: 'Ok Butonları' },
                      { key: 'show_navigation_dots', label: 'Nokta Gösterge' },
                      { key: 'show_progress_bar', label: 'İlerleme Çubuğu' },
                      { key: 'show_slide_counter', label: 'Slide Sayacı' },
                      { key: 'show_scroll_indicator', label: 'Scroll Göstergesi' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm[item.key as keyof SliderSettings] as boolean}
                          onChange={(e) => setSettingsForm(prev => prev ? { ...prev, [item.key]: e.target.checked } : null)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-300">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Effects Section */}
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                  <h3 className="font-medium text-white mb-4">Görsel Efektler</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.ken_burns_effect}
                        onChange={(e) => setSettingsForm(prev => prev ? { ...prev, ken_burns_effect: e.target.checked } : null)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-300">Ken Burns Zoom</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.scan_line_effect}
                        onChange={(e) => setSettingsForm(prev => prev ? { ...prev, scan_line_effect: e.target.checked } : null)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-300">Tarama Çizgisi</span>
                    </label>
                  </div>
                </div>
                
                {/* Badge Section */}
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Rozet</h3>
                      <p className="text-sm text-gray-400">Slider üzerindeki bilgi rozeti</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.badge.enabled}
                        onChange={(e) => setSettingsForm(prev => prev ? { 
                          ...prev, 
                          badge: { ...prev.badge, enabled: e.target.checked } 
                        } : null)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                  
                  {settingsForm.badge.enabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Rozet Metni</label>
                        <input
                          type="text"
                          value={settingsForm.badge.text}
                          onChange={(e) => setSettingsForm(prev => prev ? { 
                            ...prev, 
                            badge: { ...prev.badge, text: e.target.value } 
                          } : null)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                          placeholder="7/24 Acil Veteriner Hizmeti"
                        />
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.badge.show_pulse}
                          onChange={(e) => setSettingsForm(prev => prev ? { 
                            ...prev, 
                            badge: { ...prev.badge, show_pulse: e.target.checked } 
                          } : null)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500"
                        />
                        <span className="text-sm text-gray-300">Nabız Animasyonu</span>
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Stats Section */}
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">İstatistikler</h3>
                      <p className="text-sm text-gray-400">Slider altındaki istatistik kutuları</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.stats.enabled}
                        onChange={(e) => setSettingsForm(prev => prev ? { 
                          ...prev, 
                          stats: { ...prev.stats, enabled: e.target.checked } 
                        } : null)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                  
                  {settingsForm.stats.enabled && settingsForm.stats.items && (
                    <div className="space-y-3">
                      {settingsForm.stats.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => {
                              const newItems = [...settingsForm.stats.items]
                              newItems[index] = { ...newItems[index], value: e.target.value }
                              setSettingsForm(prev => prev ? { 
                                ...prev, 
                                stats: { ...prev.stats, items: newItems } 
                              } : null)
                            }}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                            placeholder="15+"
                          />
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const newItems = [...settingsForm.stats.items]
                              newItems[index] = { ...newItems[index], label: e.target.value }
                              setSettingsForm(prev => prev ? { 
                                ...prev, 
                                stats: { ...prev.stats, items: newItems } 
                              } : null)
                            }}
                            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                            placeholder="Yıllık Deneyim"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
