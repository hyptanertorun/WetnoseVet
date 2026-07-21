'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, FileText, Target, MapPin, Sliders, 
  Send, Loader2, CheckCircle2, AlertCircle,
  ChevronRight, BookOpen, Zap, ArrowRight
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { useAuthStore } from '@/lib/adminAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ContentTone = 'professional' | 'warm' | 'informative'

interface AIUsageStats {
  total_image_generations: number
  total_blog_generations: number
  total_revisions: number
  last_7_days: { image_generations: number; blog_generations: number; revisions: number }
  estimated_cost_usd: number
}

function AIUsageCard() {
  const [usage, setUsage] = useState<AIUsageStats | null>(null)
  useEffect(() => {
    adminApi.request<AIUsageStats>('/api/admin/ai-usage').then(res => {
      if (res.data) setUsage(res.data)
    })
  }, [])
  if (!usage) return null
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" data-testid="ai-usage-card">
      <span className="text-gray-400 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" /> AI Kullanımı (son 7 gün):
      </span>
      <span className="text-gray-300">Blog: <b className="text-white">{usage.last_7_days.blog_generations}</b></span>
      <span className="text-gray-300">Görsel: <b className="text-white">{usage.last_7_days.image_generations}</b></span>
      <span className="text-gray-300">Revizyon: <b className="text-white">{usage.last_7_days.revisions}</b></span>
      <span className="text-gray-300 ml-auto">Tahmini maliyet: <b className="text-purple-300">${usage.estimated_cost_usd.toFixed(2)}</b></span>
    </div>
  )
}
type ContentLength = 'short' | 'medium' | 'long'
type CTAPreference = 'appointment' | 'whatsapp' | 'none'

interface GenerationResult {
  success: boolean
  message: string
  data?: {
    generation_id: string
    blog_post_id: string
    output: {
      title: string
      slug: string
      meta_title: string
      meta_description: string
      outline: string[]
      content_html: string
      faq: Array<{ question: string; answer: string }>
      tags: string[]
      category_suggestion: string
      disclaimer: string
    }
    processing_time_ms: number
    status: string
  }
}

export default function AIBlogWriterPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  
  // Form state
  const [topicTitle, setTopicTitle] = useState('')
  const [targetKeyword, setTargetKeyword] = useState('')
  const [secondaryKeywords, setSecondaryKeywords] = useState('')
  const [locationTarget, setLocationTarget] = useState('')
  const [tone, setTone] = useState<ContentTone>('professional')
  const [contentLength, setContentLength] = useState<ContentLength>('medium')
  const [ctaPreference, setCtaPreference] = useState<CTAPreference>('appointment')
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState('')
  
  const handleGenerate = async () => {
    if (!topicTitle.trim()) {
      setError('Konu başlığı gereklidir')
      return
    }
    if (!targetKeyword.trim()) {
      setError('Ana anahtar kelime gereklidir')
      return
    }
    
    setError('')
    setIsGenerating(true)
    setResult(null)
    
    try {
      const res = await adminApi.request<GenerationResult>('/api/admin/ai-blog/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic_title: topicTitle.trim(),
          target_keyword: targetKeyword.trim(),
          secondary_keywords: secondaryKeywords.trim() || null,
          location_target: locationTarget.trim() || null,
          tone,
          content_length: contentLength,
          cta_preference: ctaPreference
        })
      })
      
      if (res.data) {
        setResult(res.data)
      } else if (res.error) {
        setError(res.error)
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-400" />
            AI Blog Writer
          </h1>
          <p className="text-gray-400 mt-1">
            GPT-5.1 ile SEO-optimize edilmiş, tıbbi etik kurallara uygun blog içeriği oluşturun
          </p>
        </div>
        
        <Link
          href="/admin/blog"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Blog Yönetimi
        </Link>
      </div>
      
      <AIUsageCard />
      
      <AIUsageCard />
      
      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brief Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              İçerik Briefi
            </h2>
            
            <div className="space-y-4">
              {/* Topic Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Konu Başlığı *
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Örn: Kedilerde kuduz aşısı ne zaman yapılır?"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              
              {/* Target Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ana Anahtar Kelime *
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="Örn: kedi kuduz aşısı"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              {/* Secondary Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  İkincil Anahtar Kelimeler
                  <span className="text-gray-500 ml-1">(virgülle ayırın)</span>
                </label>
                <input
                  type="text"
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  placeholder="Örn: kedi aşı takvimi, kuduz belirtileri"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              
              {/* Location Target */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hedef Lokasyon
                  <span className="text-gray-500 ml-1">(yerel SEO için)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={locationTarget}
                    onChange={(e) => setLocationTarget(e.target.value)}
                    placeholder="Örn: Kocaeli, İzmit"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              İçerik Ayarları
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Ton
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'professional', label: '🏥 Profesyonel', desc: 'Bilimsel, otoriter' },
                    { value: 'warm', label: '💝 Sıcak', desc: 'Samimi, empatik' },
                    { value: 'informative', label: '📚 Bilgilendirici', desc: 'Eğitici, adım adım' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTone(option.value as ContentTone)}
                      className={cn(
                        "w-full p-3 rounded-xl border-2 text-left transition-all",
                        tone === option.value
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        tone === option.value ? "text-purple-400" : "text-white"
                      )}>
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {option.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Content Length */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  İçerik Uzunluğu
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'short', label: '📄 Kısa', desc: '800-1000 kelime' },
                    { value: 'medium', label: '📋 Orta', desc: '1200-1600 kelime' },
                    { value: 'long', label: '📖 Uzun', desc: '1800-2200 kelime' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setContentLength(option.value as ContentLength)}
                      className={cn(
                        "w-full p-3 rounded-xl border-2 text-left transition-all",
                        contentLength === option.value
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        contentLength === option.value ? "text-cyan-400" : "text-white"
                      )}>
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {option.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* CTA Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  CTA Tercihi
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'appointment', label: '📅 Randevu', desc: 'Randevu almaya teşvik' },
                    { value: 'whatsapp', label: '💬 WhatsApp', desc: 'İletişime geçmeye teşvik' },
                    { value: 'none', label: '❌ Yok', desc: 'CTA olmadan' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCtaPreference(option.value as CTAPreference)}
                      className={cn(
                        "w-full p-3 rounded-xl border-2 text-left transition-all",
                        ctaPreference === option.value
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium",
                        ctaPreference === option.value ? "text-teal-400" : "text-white"
                      )}>
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {option.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Error Message */}
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
          
          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3",
              isGenerating
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI İçerik Oluşturuluyor...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                AI ile Taslak Oluştur
              </>
            )}
          </motion.button>
        </div>
        
        {/* Right Sidebar - Tips & Result */}
        <div className="space-y-6">
          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              İpuçları
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Spesifik konular daha iyi sonuç verir</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Anahtar kelimeleri doğal tutun</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Yerel SEO için lokasyon ekleyin</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Oluşturulan içeriği her zaman kontrol edin</span>
              </li>
            </ul>
          </motion.div>
          
          {/* Result Card */}
          <AnimatePresence>
            {result && result.success && result.data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 text-green-400 mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">İçerik Oluşturuldu!</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Başlık</p>
                    <p className="text-sm text-white font-medium">{result.data.output.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">URL</p>
                    <p className="text-sm text-gray-400">/blog/{result.data.output.slug}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">İşlem Süresi</p>
                    <p className="text-sm text-gray-400">{(result.data.processing_time_ms / 1000).toFixed(1)}s</p>
                  </div>
                  
                  {result.data.output.tags && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Etiketler</p>
                      <div className="flex flex-wrap gap-1">
                        {result.data.output.tags.slice(0, 5).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => router.push(`/admin/blog?edit=${result.data!.blog_post_id}`)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-green-500/20 text-green-400 font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  Düzenle ve Yayınla
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Ethical Notice */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">⚕️ Tıbbi Etik</h3>
            <p className="text-xs text-gray-500">
              AI tarafından oluşturulan tüm içerikler tıbbi etik kurallara uyar: 
              tedavi garantisi verilmez, dozaj bilgisi içermez, her zaman veteriner hekim 
              danışmanlığı önerir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
