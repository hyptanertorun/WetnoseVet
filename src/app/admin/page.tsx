'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, ClipboardList, Stethoscope, FileText, 
  TrendingUp, Calendar, Clock, Activity, Flame,
  Phone, AlertTriangle, ChevronRight, Loader2,
  PhoneCall, MessageCircle, CheckCircle2, AlertCircle,
  Star, ThumbsUp, ThumbsDown, Sparkles, Zap, Info, ImageIcon, Mail,
  Shield, History, Edit, Trash2, Eye, LogIn, LogOut, UserPlus, Settings
} from 'lucide-react'
import { useAuthStore, canAccessPage } from '@/lib/adminAuth'
import { adminApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface DashboardStats {
  today_summary: {
    new_requests: number
    contacted: number
    scheduled: number
    hot_leads: number
    today_follow_ups: number
    overdue_follow_ups: number
  }
  follow_ups_today: Array<{
    id: string
    name: string
    phone: string
    email: string | null
    pet_name: string | null
    service_requested: string | null
    follow_up_at: string | null
    status: string
    lead_heat: string
    lead_score: number
    is_overdue: boolean
  }>
  overdue_follow_ups: Array<{
    id: string
    name: string
    phone: string
    email: string | null
    pet_name: string | null
    service_requested: string | null
    follow_up_at: string | null
    status: string
    lead_heat: string
    lead_score: number
    is_overdue: boolean
  }>
  weekly_trend: Array<{
    date: string
    count: number
  }>
}

interface TestimonialAnalytics {
  overall_avg_rating: number
  last_30_days_avg_rating: number
  total_count: number
  rating_distribution: Array<{ rating: number; count: number; percentage: number }>
  positive_count: number
  neutral_count: number
  negative_count: number
  positive_ratio: number
  attention_needed_count: number
  pending_count: number
}

interface Testimonial {
  id: string
  full_name: string
  pet_name: string
  rating: number
  comment: string
  status: string
  submitted_at: string
}

interface AIUsageStats {
  total_image_generations: number
  total_blog_generations: number
  total_revisions: number
  last_7_days: {
    image_generations: number
    blog_generations: number
    revisions: number
  }
  estimated_cost_usd: number
}

interface GalleryStats {
  total_albums: number
  active_albums: number
  total_images: number
  albums: Array<{ title: string; count: number }>
}

interface ContactStats {
  total: number
  new: number
  read: number
  replied: number
  archived: number
}

interface AuditLog {
  id: string
  actor_email: string | null
  actor_role: string | null
  entity_type: string
  entity_id: string | null
  action: string
  timestamp: string
  success: boolean
}

// Helper to get action icon
const getActionIcon = (action: string) => {
  switch (action) {
    case 'create': return <UserPlus className="w-3.5 h-3.5" />
    case 'update': return <Edit className="w-3.5 h-3.5" />
    case 'delete': return <Trash2 className="w-3.5 h-3.5" />
    case 'view': return <Eye className="w-3.5 h-3.5" />
    case 'login': return <LogIn className="w-3.5 h-3.5" />
    case 'logout': return <LogOut className="w-3.5 h-3.5" />
    case 'status_change': return <Settings className="w-3.5 h-3.5" />
    default: return <Activity className="w-3.5 h-3.5" />
  }
}

// Helper to get action color
const getActionColor = (action: string) => {
  switch (action) {
    case 'create': return 'text-green-400 bg-green-500/20'
    case 'update': return 'text-blue-400 bg-blue-500/20'
    case 'delete': return 'text-red-400 bg-red-500/20'
    case 'login': return 'text-teal-400 bg-teal-500/20'
    case 'logout': return 'text-gray-400 bg-gray-500/20'
    case 'status_change': return 'text-yellow-400 bg-yellow-500/20'
    default: return 'text-purple-400 bg-purple-500/20'
  }
}

// Helper to get entity label in Turkish
const getEntityLabel = (entity: string) => {
  const labels: Record<string, string> = {
    'user': 'Kullanıcı',
    'blog': 'Blog',
    'service': 'Hizmet',
    'team': 'Ekip',
    'testimonial': 'Yorum',
    'slider': 'Slider',
    'gallery': 'Galeri',
    'appointment': 'Randevu',
    'settings': 'Ayarlar',
    'contact': 'İletişim'
  }
  return labels[entity] || entity
}

// Helper to get action label in Turkish
const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    'create': 'Oluşturdu',
    'update': 'Güncelledi',
    'delete': 'Sildi',
    'view': 'Görüntüledi',
    'login': 'Giriş yaptı',
    'logout': 'Çıkış yaptı',
    'status_change': 'Durum değiştirdi',
    'password_reset': 'Şifre sıfırladı',
    'password_change': 'Şifre değiştirdi',
    'ai_generate': 'AI ile üretti'
  }
  return labels[action] || action
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [testimonialStats, setTestimonialStats] = useState<TestimonialAnalytics | null>(null)
  const [recentTestimonials, setRecentTestimonials] = useState<Testimonial[]>([])
  const [aiUsageStats, setAiUsageStats] = useState<AIUsageStats | null>(null)
  const [galleryStats, setGalleryStats] = useState<GalleryStats | null>(null)
  const [contactStats, setContactStats] = useState<ContactStats | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [dashRes, testimonialRes, aiUsageRes, galleryRes, contactRes, auditRes, recentTestRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getTestimonialAnalytics(),
        adminApi.request<AIUsageStats>('/api/admin/ai-usage'),
        adminApi.request<GalleryStats>('/api/admin/gallery/stats'),
        adminApi.getContactStats(),
        adminApi.getAuditLogs(1, 8),
        adminApi.getTestimonials(1, 5, { sort_by: 'submitted_at', sort_order: 'desc' })
      ])
      
      if (dashRes.data) {
        setStats(dashRes.data)
      }
      if (testimonialRes.data) {
        setTestimonialStats(testimonialRes.data)
      }
      if (aiUsageRes.data) {
        setAiUsageStats(aiUsageRes.data)
      }
      if (galleryRes.data) {
        setGalleryStats(galleryRes.data)
      }
      if (contactRes.data) {
        setContactStats(contactRes.data)
      }
      if (auditRes.data) {
        setAuditLogs(auditRes.data.logs)
      }
      if (recentTestRes.data) {
        setRecentTestimonials(recentTestRes.data.testimonials)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
    setLoading(false)
  }

  if (!mounted) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Günaydın'
    if (hour < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  // Check if user is Admin or Manager (full dashboard) or Reception (simplified)
  const isFullAccess = user?.role === 'admin' || user?.role === 'manager'

  // Summary cards for today
  const todayStats = stats?.today_summary ? [
    { label: 'Yeni Talepler', value: stats.today_summary.new_requests, icon: ClipboardList, color: 'from-blue-500 to-blue-600' },
    { label: 'İletişime Geçilen', value: stats.today_summary.contacted, icon: PhoneCall, color: 'from-yellow-500 to-amber-500' },
    { label: 'Randevuya Dönen', value: stats.today_summary.scheduled, icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { label: 'Sıcak Lead', value: stats.today_summary.hot_leads, icon: Flame, color: 'from-red-500 to-orange-500' },
    { label: 'Bugün Takip', value: stats.today_summary.today_follow_ups, icon: Clock, color: 'from-teal-500 to-cyan-500' },
    { label: 'Gecikmiş Takip', value: stats.today_summary.overdue_follow_ups, icon: AlertTriangle, color: 'from-red-600 to-red-700', alert: stats.today_summary.overdue_follow_ups > 0 },
  ] : []

  // Mini sparkline from weekly trend
  const maxCount = stats?.weekly_trend ? Math.max(...stats.weekly_trend.map(d => d.count), 1) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {getGreeting()}, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Günlük Klinik Özeti - {format(new Date(), 'dd MMMM yyyy', { locale: tr })}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Today Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {todayStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative bg-gray-900/50 border rounded-xl p-4 overflow-hidden",
                  stat.alert ? "border-red-500/50 animate-pulse" : "border-gray-800"
                )}
              >
                <div className={cn(
                  "absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 bg-gradient-to-br",
                  stat.color
                )} />
                
                <div className="relative">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br",
                    stat.color
                  )}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    stat.alert ? "text-red-400" : "text-white"
                  )}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content - 3 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Follow-ups & Audit Logs (Span 2) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Overdue Follow-ups (RED) */}
              {stats?.overdue_follow_ups && stats.overdue_follow_ups.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Gecikmiş Takipler
                    </h2>
                    <Link href="/admin/crm" className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                      Tümünü Gör <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="space-y-2">
                    {stats.overdue_follow_ups.slice(0, 5).map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{item.name}</span>
                            {item.lead_heat === 'hot' && <Flame className="w-4 h-4 text-red-400" />}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span>{item.phone}</span>
                            {item.service_requested && <span>• {item.service_requested}</span>}
                          </div>
                          {item.follow_up_at && (
                            <p className="text-xs text-red-400 mt-1">
                              Takip: {formatDistanceToNow(new Date(item.follow_up_at), { addSuffix: true, locale: tr })}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`tel:${item.phone}`}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4 text-red-400" />
                          </a>
                          <a 
                            href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-4 h-4 text-green-400" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Follow-ups */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-400" />
                    Bugün Aranacaklar
                  </h2>
                  <Link href="/admin/crm" className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1">
                    CRM'e Git <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                {stats?.follow_ups_today && stats.follow_ups_today.length > 0 ? (
                  <div className="space-y-2">
                    {stats.follow_ups_today.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800/80 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{item.name}</span>
                            {item.lead_heat === 'hot' && <Flame className="w-4 h-4 text-red-400" />}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400">
                              {item.lead_score} puan
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span>{item.phone}</span>
                            {item.pet_name && <span>• {item.pet_name}</span>}
                            {item.service_requested && <span>• {item.service_requested}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`tel:${item.phone}`}
                            className="p-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4 text-teal-400" />
                          </a>
                          <a 
                            href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-4 h-4 text-green-400" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500/50 mb-3" />
                    <p className="text-gray-400">Bugün takip edilecek kimse yok</p>
                    <p className="text-sm text-gray-500 mt-1">Tüm takipler tamamlanmış</p>
                  </div>
                )}
              </div>

              {/* Audit Logs Section - NEW */}
              {isFullAccess && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-purple-400" />
                      Son İşlem Kayıtları
                    </h2>
                    <Link href="/admin/audit-logs" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                      Tümünü Gör <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  {auditLogs.length > 0 ? (
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div 
                          key={log.id}
                          className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800/80 transition-colors"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            getActionColor(log.action)
                          )}>
                            {getActionIcon(log.action)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-white text-sm truncate">
                                {log.actor_email?.split('@')[0] || 'Sistem'}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {getActionLabel(log.action)}
                              </span>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                "bg-gray-700/50 text-gray-300"
                              )}>
                                {getEntityLabel(log.entity_type)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: tr })}
                            </p>
                          </div>
                          
                          {!log.success && (
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <History className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-gray-400">Henüz işlem kaydı yok</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Right Column - Stats & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {/* Weekly Trend */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  Son 7 Gün Talepleri
                </h2>
                
                {stats?.weekly_trend && (
                  <div className="space-y-2">
                    {/* Mini Bar Chart */}
                    <div className="flex items-end justify-between h-20 gap-1">
                      {stats.weekly_trend.map((day, idx) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center">
                          <div 
                            className={cn(
                              "w-full rounded-t transition-all",
                              idx === stats.weekly_trend.length - 1 ? "bg-teal-500" : "bg-gray-700"
                            )}
                            style={{ height: `${Math.max((day.count / maxCount) * 100, 4)}%` }}
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {format(new Date(day.date), 'EEE', { locale: tr }).charAt(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <span className="text-sm text-gray-400">Toplam</span>
                      <span className="text-lg font-bold text-white">
                        {stats.weekly_trend.reduce((sum, d) => sum + d.count, 0)} talep
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Testimonials - NEW */}
              {recentTestimonials.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-yellow-400" />
                      Son Yorumlar
                    </h2>
                    <Link href="/admin/testimonials" className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1">
                      Tümü <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    {recentTestimonials.slice(0, 3).map((testimonial) => (
                      <div 
                        key={testimonial.id}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate">
                              {testimonial.full_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {testimonial.pet_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "w-3 h-3",
                                  i <= testimonial.rating 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-gray-600"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {testimonial.comment}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(testimonial.submitted_at), { addSuffix: true, locale: tr })}
                          </span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            testimonial.status === 'pending' ? "bg-yellow-500/20 text-yellow-400" :
                            testimonial.status === 'approved' ? "bg-green-500/20 text-green-400" :
                            "bg-red-500/20 text-red-400"
                          )}>
                            {testimonial.status === 'pending' ? 'Bekliyor' :
                             testimonial.status === 'approved' ? 'Onaylı' : 'Reddedildi'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonials Stats Widget */}
              {testimonialStats && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Müşteri Memnuniyeti
                    </h2>
                  </div>
                  
                  {/* Rating Summary */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{testimonialStats.overall_avg_rating.toFixed(1)}</div>
                      <div className="flex justify-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-3 h-3",
                              i <= Math.round(testimonialStats.overall_avg_rating) 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-gray-600"
                            )}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Genel Puan</div>
                    </div>
                    
                    <div className="flex-1 border-l border-gray-700 pl-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">Son 30 gün</span>
                        <span className="text-white font-medium">{testimonialStats.last_30_days_avg_rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">Olumlu</span>
                        <span className="text-green-400 font-medium flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> {testimonialStats.positive_ratio.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Toplam</span>
                        <span className="text-white font-medium">{testimonialStats.total_count}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alerts */}
                  <div className="flex gap-2">
                    {testimonialStats.pending_count > 0 && (
                      <div className="flex-1 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="text-yellow-400 text-xs">Bekleyen</div>
                        <div className="text-white font-bold">{testimonialStats.pending_count}</div>
                      </div>
                    )}
                    {testimonialStats.attention_needed_count > 0 && (
                      <div className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="text-red-400 text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Dikkat
                        </div>
                        <div className="text-white font-bold">{testimonialStats.attention_needed_count}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Usage Widget */}
              {aiUsageStats && isFullAccess && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      AI Kullanımı
                    </h2>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      Son 7 gün
                    </span>
                  </div>
                  
                  {/* Usage Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-pink-400" />
                        Görsel Üretimi
                      </span>
                      <span className="text-white font-medium">{aiUsageStats.last_7_days.image_generations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        Blog Üretimi
                      </span>
                      <span className="text-white font-medium">{aiUsageStats.last_7_days.blog_generations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-400" />
                        Revizyon
                      </span>
                      <span className="text-white font-medium">{aiUsageStats.last_7_days.revisions}</span>
                    </div>
                  </div>
                  
                  {/* Total & Cost */}
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Toplam İşlem</span>
                      <span className="text-white font-bold">
                        {aiUsageStats.total_image_generations + aiUsageStats.total_blog_generations + aiUsageStats.total_revisions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Tahmini Maliyet</span>
                      <span className="text-purple-400 font-bold">
                        ${aiUsageStats.estimated_cost_usd.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-3">
                    <p className="text-xs text-gray-500">
                      LLM key bakiyesinden düşülür
                    </p>
                    <div className="relative group">
                      <Info className="w-3.5 h-3.5 text-gray-500 cursor-help hover:text-purple-400 transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <p className="text-xs font-semibold text-white mb-2">Tahmini Fiyatlar</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Görsel Üretimi</span>
                            <span className="text-purple-400">~$0.05</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Blog Üretimi</span>
                            <span className="text-purple-400">~$0.03</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Revizyon</span>
                            <span className="text-purple-400">~$0.02</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                          <div className="border-8 border-transparent border-t-gray-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-teal-400" />
                  Hızlı İşlemler
                </h2>
                
                <div className="space-y-2">
                  {/* Contact Messages Alert */}
                  {contactStats && contactStats.new > 0 && (
                    <Link
                      href="/admin/contact"
                      className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                    >
                      <div className="relative">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {contactStats.new}
                        </span>
                      </div>
                      <span className="text-sm text-blue-300">Yeni İletişim Mesajı</span>
                    </Link>
                  )}
                  
                  <Link
                    href="/admin/crm"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-colors"
                  >
                    <ClipboardList className="w-5 h-5 text-teal-400" />
                    <span className="text-sm text-gray-300">Randevu Talepleri</span>
                  </Link>
                  <Link
                    href="/admin/services"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-colors"
                  >
                    <Stethoscope className="w-5 h-5 text-teal-400" />
                    <span className="text-sm text-gray-300">Hizmet Yönetimi</span>
                  </Link>
                  <Link
                    href="/admin/team"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-colors"
                  >
                    <Users className="w-5 h-5 text-teal-400" />
                    <span className="text-sm text-gray-300">Ekip Yönetimi</span>
                  </Link>
                  {isFullAccess && (
                    <Link
                      href="/admin/audit-logs"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 transition-colors"
                    >
                      <Shield className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-gray-300">Denetim Kayıtları</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
