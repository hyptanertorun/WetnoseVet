'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList, Stethoscope, FileText,
  Calendar, Clock, Flame,
  Phone, AlertTriangle, ChevronRight, Loader2,
  MessageCircle, CheckCircle2,
  Star, Sparkles, Mail, MessageSquare,
  History, Settings, Plus, TrendingUp, CalendarCheck
} from 'lucide-react'
import { useAuthStore } from '@/lib/adminAuth'
import { adminApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface FollowUpItem {
  id: string
  name: string
  phone: string
  pet_name: string | null
  service_requested: string | null
  follow_up_at: string | null
  lead_heat: string
  lead_score: number
}

interface DashboardStats {
  today_summary: {
    new_requests: number
    contacted: number
    scheduled: number
    hot_leads: number
    today_follow_ups: number
    overdue_follow_ups: number
  }
  follow_ups_today: FollowUpItem[]
  overdue_follow_ups: FollowUpItem[]
  weekly_trend: Array<{ date: string; count: number }>
}

interface TestimonialAnalytics {
  overall_avg_rating: number
  total_count: number
  pending_count: number
}

interface ContactStats {
  total: number
  new: number
  read: number
  replied: number
}

interface AuditLog {
  id: string
  actor_email: string | null
  entity_type: string
  action: string
  timestamp: string
}

interface HealthIssue {
  severity: 'warning' | 'error'
  message: string
  href: string
}

const ENTITY_LABELS: Record<string, string> = {
  user: 'kullanıcı', blog: 'blog yazısı', service: 'hizmet', team: 'ekip üyesi',
  testimonial: 'yorum', slider: 'slider', gallery: 'galeri', appointment: 'randevu talebi',
  settings: 'ayarlar', contact: 'mesaj', clinic_rhythm: 'klinik içeriği'
}

const ACTION_LABELS: Record<string, string> = {
  create: 'oluşturdu', update: 'güncelledi', delete: 'sildi', archive: 'arşivledi',
  restore: 'geri yükledi', status_change: 'durumunu değiştirdi', ai_generate: 'AI ile üretti'
}

const NOISE_ACTIONS = ['login', 'logout', 'login_failed', 'token_refresh', 'view']

function FollowUpRow({ item, variant }: { item: FollowUpItem; variant: 'red' | 'normal' }) {
  return (
    <div
      data-testid={`followup-row-${item.id}`}
      className={cn(
        "flex items-center justify-between rounded-lg p-3 border transition-colors",
        variant === 'red'
          ? "bg-red-500/5 border-red-500/20"
          : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/80"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">{item.name}</span>
          {item.lead_heat === 'hot' && <Flame className="w-4 h-4 text-red-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400 mt-0.5">
          <span>{item.phone}</span>
          {item.service_requested && <span className="truncate">• {item.service_requested}</span>}
        </div>
        {variant === 'red' && item.follow_up_at && (
          <p className="text-xs text-red-400 mt-0.5">
            Takip: {formatDistanceToNow(new Date(item.follow_up_at), { addSuffix: true, locale: tr })}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <a href={`tel:${item.phone.replace(/\s/g, '')}`} data-testid={`followup-call-${item.id}`}
          className="p-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg transition-colors" title="Ara">
          <Phone className="w-4 h-4 text-teal-400" />
        </a>
        <a href={`https://wa.me/${item.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
          data-testid={`followup-wa-${item.id}`}
          className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors" title="WhatsApp">
          <MessageCircle className="w-4 h-4 text-green-400" />
        </a>
        <Link href="/admin/crm" className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors" title="CRM'de aç">
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [testimonialStats, setTestimonialStats] = useState<TestimonialAnalytics | null>(null)
  const [contactStats, setContactStats] = useState<ContactStats | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([])

  const role = user?.role || 'editor'
  const isOps = ['admin', 'manager', 'reception'].includes(role)
  const isContent = ['admin', 'manager', 'editor'].includes(role)
  const isManagement = ['admin', 'manager'].includes(role)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      try {
        const [dashRes, contactRes, testimonialRes, auditRes, healthRes] = await Promise.all([
          isOps ? adminApi.getDashboardStats() : Promise.resolve({ data: null }),
          isOps ? adminApi.getContactStats() : Promise.resolve({ data: null }),
          isContent ? adminApi.getTestimonialAnalytics() : Promise.resolve({ data: null }),
          isManagement ? adminApi.getAuditLogs(1, 15) : Promise.resolve({ data: null }),
          isContent ? adminApi.request<{ issues: HealthIssue[] }>('/api/admin/system-health') : Promise.resolve({ data: null }),
        ])
        if (dashRes.data) setStats(dashRes.data as DashboardStats)
        if (contactRes.data) setContactStats(contactRes.data as ContactStats)
        if (testimonialRes.data) setTestimonialStats(testimonialRes.data as TestimonialAnalytics)
        const healthData = healthRes.data as { issues: HealthIssue[] } | null
        if (healthData?.issues) setHealthIssues(healthData.issues)
        const auditData = auditRes.data as { logs: AuditLog[] } | null
        if (auditData?.logs) {
          setAuditLogs(auditData.logs.filter(l => !NOISE_ACTIONS.includes(l.action)).slice(0, 5))
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role])

  if (!mounted) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Günaydın'
    if (hour < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  const s = stats?.today_summary

  // Level 1: action items — only show cards with meaning; count 0 renders muted
  const actionCards = [
    ...(isOps ? [
      { label: 'Yeni Randevu Talebi', value: s?.new_requests ?? 0, icon: ClipboardList, href: '/admin/crm', color: 'blue', testid: 'action-new-requests' },
      { label: 'Yeni Mesaj', value: contactStats?.new ?? 0, icon: Mail, href: '/admin/contact', color: 'cyan', testid: 'action-new-messages' },
      { label: 'Gecikmiş Takip', value: s?.overdue_follow_ups ?? 0, icon: AlertTriangle, href: '/admin/crm', color: 'red', alert: (s?.overdue_follow_ups ?? 0) > 0, testid: 'action-overdue' },
      { label: 'Bugün Aranacak', value: s?.today_follow_ups ?? 0, icon: Clock, href: '/admin/crm', color: 'teal', testid: 'action-today-followups' },
      { label: 'Sıcak Lead', value: s?.hot_leads ?? 0, icon: Flame, href: '/admin/crm', color: 'orange', testid: 'action-hot-leads' },
    ] : []),
    ...(isContent ? [
      { label: 'Onay Bekleyen Yorum', value: testimonialStats?.pending_count ?? 0, icon: MessageSquare, href: '/admin/testimonials', color: 'purple', testid: 'action-pending-testimonials' },
    ] : []),
  ]

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600', cyan: 'from-cyan-500 to-sky-600',
    red: 'from-red-600 to-red-700', teal: 'from-teal-500 to-cyan-500',
    orange: 'from-red-500 to-orange-500', purple: 'from-purple-500 to-purple-600',
  }

  // Level 2: quick actions by role
  const quickActions = [
    ...(isOps ? [
      { label: 'Randevu Talebi Ekle', icon: Plus, href: '/admin/crm', testid: 'quick-new-appointment' },
    ] : []),
    ...(isContent ? [
      { label: 'AI ile Blog Yaz', icon: Sparkles, href: '/admin/blog/ai-writer', testid: 'quick-ai-blog' },
      { label: 'Yeni Hizmet', icon: Stethoscope, href: '/admin/services', testid: 'quick-new-service' },
      { label: 'Yorumları Yönet', icon: Star, href: '/admin/testimonials', testid: 'quick-testimonials' },
    ] : []),
    ...(isManagement ? [
      { label: 'Site Ayarları', icon: Settings, href: '/admin/settings', testid: 'quick-settings' },
    ] : []),
  ]

  const maxTrend = stats?.weekly_trend ? Math.max(...stats.weekly_trend.map(d => d.count), 1) : 1
  const weekTotal = stats?.weekly_trend?.reduce((acc, d) => acc + d.count, 0) ?? 0

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {getGreeting()}, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">
          {format(new Date(), 'dd MMMM yyyy EEEE', { locale: tr })}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── SEVİYE 1: Bugün İlgilenilmesi Gerekenler ── */}
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Bugün İlgilenilmesi Gerekenler
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {actionCards.map((card, index) => (
                <motion.div key={card.label}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link href={card.href} data-testid={card.testid}
                    className={cn(
                      "relative block bg-gray-900/50 border rounded-xl p-4 overflow-hidden transition-colors hover:border-teal-500/40",
                      card.alert ? "border-red-500/50" : card.value > 0 ? "border-gray-700" : "border-gray-800 opacity-60"
                    )}
                  >
                    <div className={cn("absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 bg-gradient-to-br", colorMap[card.color])} />
                    <div className="relative">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br", colorMap[card.color])}>
                        <card.icon className="w-4.5 h-4.5 w-[18px] h-[18px] text-white" />
                      </div>
                      <p className="text-xs text-gray-400 mb-0.5">{card.label}</p>
                      <p className={cn("text-2xl font-bold", card.alert ? "text-red-400" : "text-white")}>{card.value}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── SEVİYE 2: Hızlı İşlemler ── */}
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" /> Hızlı İşlemler
            </h2>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} data-testid={action.testid}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/70 border border-gray-700/50 text-sm text-gray-200 hover:bg-teal-500/15 hover:border-teal-500/40 hover:text-teal-300 transition-colors"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </section>

          {/* ── Takip listeleri (yalnızca operasyon rolleri) ── */}
          {isOps && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gecikmiş Takipler */}
              {stats?.overdue_follow_ups && stats.overdue_follow_ups.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4" data-testid="overdue-followups-panel">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Gecikmiş Takipler
                    </h3>
                    <Link href="/admin/crm" className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                      Tümü <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {stats.overdue_follow_ups.slice(0, 5).map((item) => (
                      <FollowUpRow key={item.id} item={item} variant="red" />
                    ))}
                  </div>
                </div>
              )}

              {/* Bugün Aranacaklar */}
              <div className={cn("bg-gray-900/50 border border-gray-800 rounded-xl p-4",
                (!stats?.overdue_follow_ups || stats.overdue_follow_ups.length === 0) && "lg:col-span-2")}
                data-testid="today-followups-panel"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-400" /> Bugün Aranacaklar
                  </h3>
                  <Link href="/admin/crm" className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1">
                    CRM'e Git <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {stats?.follow_ups_today && stats.follow_ups_today.length > 0 ? (
                  <div className="space-y-2">
                    {stats.follow_ups_today.map((item) => (
                      <FollowUpRow key={item.id} item={item} variant="normal" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500/50 mb-2" />
                    <p className="text-gray-400">Bugün takip edilecek kimse yok</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Yeni takip eklemek için <Link href="/admin/crm" className="text-teal-400 hover:underline">Randevu Talepleri</Link> sayfasını kullanın
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SEVİYE 3: Durum Özeti (kompakt) ── */}
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" /> Durum Özeti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isOps && stats?.weekly_trend && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4" data-testid="summary-weekly-trend">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">Son 7 Gün Talepleri</p>
                    <p className="text-lg font-bold text-white">{weekTotal}</p>
                  </div>
                  <div className="flex items-end gap-1.5 h-12">
                    {stats.weekly_trend.map((day) => (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-teal-500/60 rounded-sm transition-all"
                          style={{ height: `${Math.max((day.count / maxTrend) * 100, 4)}%` }} />
                        <span className="text-[9px] text-gray-500">
                          {format(new Date(day.date), 'EEEEE', { locale: tr })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isOps && s && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4" data-testid="summary-conversion">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Randevuya Dönüşen</p>
                    <p className="text-xl font-bold text-white">{s.scheduled} <span className="text-sm text-gray-500 font-normal">/ iletişime geçilen {s.contacted}</span></p>
                  </div>
                </div>
              )}
              {isContent && testimonialStats && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center gap-4" data-testid="summary-satisfaction">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Müşteri Memnuniyeti</p>
                    <p className="text-xl font-bold text-white">
                      {testimonialStats.overall_avg_rating?.toFixed(1) ?? '—'}
                      <span className="text-sm text-gray-500 font-normal"> / 5 • {testimonialStats.total_count} yorum</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── SİSTEM SAĞLIĞI (yalnızca sorun varsa görünür) ── */}
          {healthIssues.length > 0 && (
            <section data-testid="system-health-panel">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-amber-400 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5" /> İçerik & Sistem Sağlığı ({healthIssues.length})
                </h3>
                <div className="space-y-1.5">
                  {healthIssues.map((issue, i) => (
                    <Link key={i} href={issue.href}
                      className="flex items-center gap-2 text-sm text-gray-300 hover:text-amber-300 transition-colors">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", issue.severity === 'error' ? 'bg-red-400' : 'bg-amber-400')} />
                      {issue.message}
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── SEVİYE 4: Son Önemli Aktiviteler (yalnızca yönetim) ── */}
          {isManagement && auditLogs.length > 0 && (
            <section data-testid="recent-activities-panel">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-400" /> Son Önemli Aktiviteler
                </h2>
                <Link href="/admin/audit-logs" className="text-gray-400 hover:text-teal-400 text-sm flex items-center gap-1">
                  Tüm İşlem Kayıtları <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl divide-y divide-gray-800/70">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="text-gray-300">
                      <span className="font-medium text-white">{log.actor_email?.split('@')[0] || 'Sistem'}</span>
                      {' '}bir {ENTITY_LABELS[log.entity_type] || log.entity_type} {ACTION_LABELS[log.action] || log.action}
                    </span>
                    <span className="ml-auto text-xs text-gray-500 shrink-0">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: tr })}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
