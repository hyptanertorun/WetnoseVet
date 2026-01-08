'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, Loader2, ZoomIn, ZoomOut, Image as ImageIcon, AlertCircle, Info, Sparkles, RefreshCw, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminApi } from '@/lib/adminApi'

interface Point {
  x: number
  y: number
}

interface Area {
  x: number
  y: number
  width: number
  height: number
}

// Preset aspect ratios with labels
export const ASPECT_PRESETS = {
  '16:9': { ratio: 16 / 9, label: '16:9 (Yatay)', width: 1920, height: 1080 },
  '4:3': { ratio: 4 / 3, label: '4:3 (Standart)', width: 800, height: 600 },
  '3:4': { ratio: 3 / 4, label: '3:4 (Dikey)', width: 400, height: 533 },
  '1:1': { ratio: 1, label: '1:1 (Kare)', width: 400, height: 400 },
} as const

export type AspectPresetKey = keyof typeof ASPECT_PRESETS

interface ImageUploadCropperProps {
  value?: string
  onChange: (url: string, focalPoint?: { x: number; y: number }) => void
  onFocalPointChange?: (focalPoint: { x: number; y: number }) => void
  aspectRatio?: number
  /** Preset aspect ratio key - overrides aspectRatio */
  aspectPreset?: AspectPresetKey
  /** Custom target dimensions to display */
  targetWidth?: number
  targetHeight?: number
  /** Show target dimensions info */
  showDimensions?: boolean
  /** Upload context (folder name) */
  uploadContext?: string
  className?: string
  disabled?: boolean
  /** Max file size in MB (default: 5) */
  maxFileSizeMB?: number
  // AI Image Generation props
  title?: string
  category?: string
  /** Hide AI generation button */
  hideAI?: boolean
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg',
      0.9
    )
  })
}

export default function ImageUploadCropper({
  value,
  onChange,
  onFocalPointChange,
  aspectRatio = 16 / 9,
  aspectPreset,
  targetWidth,
  targetHeight,
  showDimensions = true,
  uploadContext = 'general',
  className,
  disabled,
  maxFileSizeMB = 5,
  title,
  category,
  hideAI = false
}: ImageUploadCropperProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingImage, setPendingImage] = useState(false)
  
  // Compute aspect ratio from preset or prop
  const presetConfig = aspectPreset ? ASPECT_PRESETS[aspectPreset] : null
  const initialAspect = presetConfig?.ratio || aspectRatio
  const [currentAspect, setCurrentAspect] = useState(initialAspect)
  
  // Compute display dimensions
  const displayWidth = targetWidth || presetConfig?.width || 1920
  const displayHeight = targetHeight || presetConfig?.height || 1080
  const maxFileSize = maxFileSizeMB * 1024 * 1024
  
  // AI Image Generation state
  const [generatingAI, setGeneratingAI] = useState(false)
  const [aiStyle, setAiStyle] = useState<'professional' | 'artistic' | 'minimalist'>('professional')
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiGeneratedUrl, setAiGeneratedUrl] = useState<string | null>(null)
  const [aiPromptUsed, setAiPromptUsed] = useState<string | null>(null)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
    
    // Calculate focal point (center of crop area relative to original image)
    const focalX = (croppedArea.x + croppedArea.width / 2) / 100
    const focalY = (croppedArea.y + croppedArea.height / 2) / 100
    onFocalPointChange?.({ x: focalX, y: focalY })
  }, [onFocalPointChange])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Sadece JPG, PNG veya WebP formatları kabul edilir')
      return
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`Dosya boyutu ${maxFileSizeMB}MB'dan küçük olmalıdır`)
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setIsModalOpen(true)
      setPendingImage(true)
    }
    reader.readAsDataURL(file)
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getAuthToken = (): string | null => {
    try {
      const stored = localStorage.getItem('wetnose-admin-auth')
      if (!stored) return null
      const parsed = JSON.parse(stored)
      return parsed.state?.accessToken || null
    } catch {
      return null
    }
  }

  const handleApprove = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setUploading(true)
    setError(null)

    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!croppedBlob) throw new Error('Görsel kırpılamadı')

      // Get auth token
      const token = getAuthToken()
      if (!token) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', croppedBlob, 'cover.jpg')
      formData.append('context', uploadContext)

      // Upload - use getApiUrl for client-side
      const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(
        `${apiUrl}/api/admin/uploads/images`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Yükleme hatası')
      }

      const data = await response.json()
      
      // Calculate focal point
      const focalX = (crop.x + 50) / 100
      const focalY = (crop.y + 50) / 100
      
      onChange(data.url, { x: focalX, y: focalY })
      setPendingImage(false)
      setIsModalOpen(false)
      setImageSrc(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    } catch (err: any) {
      setError(err.message || 'Yükleme hatası')
    }

    setUploading(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setPendingImage(false)
    setError(null)
  }

  // AI Image Generation
  const handleGenerateAI = async () => {
    if (!title) {
      setError('AI görsel üretmek için önce başlık girin')
      return
    }

    setGeneratingAI(true)
    setError(null)
    setShowAiModal(true)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
      }

      // Use window.location.origin for client-side API calls
      const apiUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(
        `${apiUrl}/api/admin/ai-image/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            category,
            style: aiStyle
          })
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'AI görsel üretilemedi')
      }

      const data = await response.json()
      setAiGeneratedUrl(data.url)
      setAiPromptUsed(data.prompt_used)
    } catch (err: any) {
      setError(err.message || 'AI görsel üretme hatası')
      setShowAiModal(false)
    }

    setGeneratingAI(false)
  }

  const handleUseAiImage = () => {
    if (aiGeneratedUrl) {
      onChange(aiGeneratedUrl, { x: 0.5, y: 0.5 })
      setShowAiModal(false)
      setAiGeneratedUrl(null)
      setAiPromptUsed(null)
    }
  }

  const handleRegenerateAI = () => {
    setAiGeneratedUrl(null)
    setAiPromptUsed(null)
    handleGenerateAI()
  }

  const handleCloseAiModal = () => {
    setShowAiModal(false)
    setAiGeneratedUrl(null)
    setAiPromptUsed(null)
    setGeneratingAI(false)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Target Dimensions Info */}
      {showDimensions && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Maximize2 className="w-3 h-3" />
          <span>Hedef boyut: {displayWidth}x{displayHeight}px</span>
          {presetConfig && <span className="text-gray-600">({presetConfig.label})</span>}
        </div>
      )}

      {/* Current Image Preview */}
      {value && (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700" style={{ aspectRatio: currentAspect }}>
          <img
            src={value}
            alt="Kapak görseli"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23374151"><rect width="100%" height="100%"/><text x="50%" y="50%" fill="%239CA3AF" text-anchor="middle" dy=".3em" font-size="12">Görsel yüklenemedi</text></svg>'
            }}
          />
        </div>
      )}

      {/* Upload & AI Generate Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors",
            disabled
              ? "border-gray-700 text-gray-500 cursor-not-allowed"
              : "border-gray-600 text-gray-400 hover:border-teal-500 hover:text-teal-400 cursor-pointer"
          )}
        >
          <Upload className="w-5 h-5" />
          <span>{value ? 'Değiştir' : 'Görsel Yükle'}</span>
        </button>
        
        {/* AI Generate Button - only show if not hidden and title exists */}
        {!hideAI && (
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={disabled || generatingAI || !title}
            title={!title ? 'Önce başlık girin' : 'AI ile görsel oluştur'}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors",
              disabled || !title
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 cursor-pointer"
            )}
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">AI Oluştur</span>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Pending Warning */}
      {pendingImage && !isModalOpen && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Görsel henüz onaylanmadı. Lütfen kırpma işlemini tamamlayın.</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Devam Et
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Crop Modal */}
      <AnimatePresence>
        {isModalOpen && imageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCancel} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">Görsel Kırpma</h3>
                <button onClick={handleCancel} className="p-2 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cropper */}
              <div className="relative flex-1 min-h-[300px] bg-black">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={currentAspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
                
                {/* Safe Area Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 p-2 bg-black/70 rounded-lg text-xs text-gray-300">
                  <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Merkez alan mobil ve kart görünümünde garanti alandır. Önemli içeriği merkeze alın.</span>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 border-t border-gray-700 space-y-4">
                {/* Zoom */}
                <div className="flex items-center gap-4">
                  <ZoomOut className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-teal-500"
                  />
                  <ZoomIn className="w-4 h-4 text-gray-400" />
                </div>

                {/* Aspect Ratio Toggle */}
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(ASPECT_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setCurrentAspect(preset.ratio)}
                      className={cn(
                        "flex-1 min-w-[80px] py-2 rounded-lg text-sm font-medium transition-colors",
                        currentAspect === preset.ratio
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/50"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Onayla & Uygula
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseAiModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">AI Görsel Oluşturucu</h3>
                </div>
                <button onClick={handleCloseAiModal} className="p-2 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Title Preview */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Başlık</p>
                  <p className="text-white font-medium">{title || 'Başlık girilmedi'}</p>
                  {category && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded text-xs">
                      {category}
                    </span>
                  )}
                </div>

                {/* Style Selection */}
                {!generatingAI && !aiGeneratedUrl && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Görsel Stili</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'professional', name: 'Profesyonel', desc: 'Temiz, modern' },
                        { id: 'artistic', name: 'Artistik', desc: 'Yaratıcı, sıcak' },
                        { id: 'minimalist', name: 'Minimalist', desc: 'Sade, odaklı' }
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setAiStyle(style.id as any)}
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all",
                            aiStyle === style.id
                              ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                          )}
                        >
                          <p className="font-medium text-sm">{style.name}</p>
                          <p className="text-xs opacity-70">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {generatingAI && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-pulse" />
                      <Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                    </div>
                    <p className="text-white font-medium mt-4">AI görsel oluşturuyor...</p>
                    <p className="text-gray-500 text-sm mt-1">Bu işlem 30-60 saniye sürebilir</p>
                  </div>
                )}

                {/* Generated Image Preview */}
                {aiGeneratedUrl && !generatingAI && (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700">
                      <img
                        src={aiGeneratedUrl}
                        alt="AI Generated Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {aiPromptUsed && (
                      <details className="text-xs text-gray-500">
                        <summary className="cursor-pointer hover:text-gray-400">Kullanılan prompt</summary>
                        <p className="mt-1 p-2 bg-gray-800 rounded text-gray-400">{aiPromptUsed}</p>
                      </details>
                    )}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-4 border-t border-gray-700">
                {!aiGeneratedUrl && !generatingAI ? (
                  <>
                    <button
                      onClick={handleCloseAiModal}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleGenerateAI}
                      disabled={!title}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Oluştur
                    </button>
                  </>
                ) : aiGeneratedUrl ? (
                  <>
                    <button
                      onClick={handleRegenerateAI}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Yeniden Oluştur
                    </button>
                    <button
                      onClick={handleUseAiImage}
                      className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Kullan
                    </button>
                  </>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
