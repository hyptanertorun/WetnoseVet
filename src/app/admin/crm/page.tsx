'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/adminApi'
import { 
  CalendarDays, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  User,
  ChevronDown,
  ChevronRight,
  Flame,
  Thermometer,
  Snowflake,
  FileText,
  Download,
  Plus,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PhoneCall,
  Calendar,
  UserCheck,
  StickyNote,
  RefreshCcw,
  Cat,
  Dog,
  Bird,
  Loader2,
  Copy,
  Check,
  Send,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Appointment {
  id: string
  name: string
  phone: string
  email: string | null
  pet_name: string | null
  pet_type: string | null
  pet_breed: string | null
  service_requested: string | null
  preferred_date: string | null
  preferred_time: string | null
  message: string | null
  source: string
  status: string
  assigned_to: string | null
  assigned_to_email: string | null
  follow_up_at: string | null
  notes: Array<{
    id: string
    content: string
    created_by: string
    created_by_email: string
    created_at: string
  }>
  lead_score: number
  lead_heat: string
  lead_score_reasons: Array<{
    factor: string
    points: number
    description: string
  }>
  created_at: string
  updated_at: string
  contacted_at: string | null
  scheduled_at: string | null
  completed_at: string | null
  // Feedback fields
  feedback_link: string | null
  feedback_sent_at: string | null
  feedback_status: string
}

interface Stats {
  total: number
  new: number
  contacted: number
  scheduled: number
  completed: number
  cancelled: number
  no_show: number
  hot_leads: number
  warm_leads: number
  cold_leads: number
  today_follow_ups: number
}

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  new: { label: 'Yeni', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: AlertCircle },
  contacted: { label: 'İletişime Geçildi', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: PhoneCall },
  scheduled: { label: 'Randevu Alındı', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Calendar },
  completed: { label: 'Tamamlandı', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2 },
  cancelled: { label: 'İptal', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  no_show: { label: 'Gelmedi', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
}

const heatConfig: Record<string, { label: string; color: string; icon: typeof Flame }> = {
  hot: { label: 'Sıcak', color: 'text-red-400', icon: Flame },
  warm: { label: 'Ilık', color: 'text-orange-400', icon: Thermometer },
  cold: { label: 'Soğuk', color: 'text-blue-400', icon: Snowflake },
}

const petTypeIcons: Record<string, typeof Cat> = {
  cat: Cat,
  dog: Dog,
  bird: Bird,
}

export default function CRMPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    lead_heat: '',
    assigned_to: '',
    search: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [appointmentsRes, statsRes, usersRes] = await Promise.all([
        adminApi.getAppointments(1, 50, filters.status || filters.lead_heat || filters.assigned_to || filters.search ? {
          status: filters.status || undefined,
          lead_heat: filters.lead_heat || undefined,
          assigned_to: filters.assigned_to || undefined,
          search: filters.search || undefined,
        } : undefined),
        adminApi.getAppointmentStats(),
        adminApi.getUsers(1, 100),
      ])

      if (appointmentsRes.data) {
        setAppointments(appointmentsRes.data.appointments)
      }
      if (statsRes.data) {
        setStats(statsRes.data)
      }
      if (usersRes.data) {
        setUsers(usersRes.data.users)
      }
    } catch (error) {
      console.error('Error loading CRM data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const res = await adminApi.updateAppointmentStatus(appointmentId, newStatus)
    if (res.data) {
      loadData()
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(res.data as Appointment)
      }
    }
  }

  const handleAssign = async (appointmentId: string, userId: string) => {
    const res = await adminApi.assignAppointment(appointmentId, userId)
    if (res.data) {
      loadData()
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(res.data as Appointment)
      }
    }
  }

  const handleAddNote = async () => {
    if (!selectedAppointment || !newNote.trim()) return
    
    const res = await adminApi.addAppointmentNote(selectedAppointment.id, newNote)
    if (res.data) {
      setSelectedAppointment(res.data as Appointment)
      setNewNote('')
      setShowNoteModal(false)
      loadData()
    }
  }

  const copyFeedbackLink = () => {
    if (!selectedAppointment?.feedback_link) return
    const baseUrl = window.location.origin
    const fullLink = baseUrl + selectedAppointment.feedback_link
    navigator.clipboard.writeText(fullLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const openWhatsApp = async () => {
    if (!selectedAppointment) return
    
    try {
      const res = await adminApi.request<{ message: string; phone: string; feedback_link: string }>(
        `/api/admin/crm/appointments/${selectedAppointment.id}/feedback-message`
      )
      
      if (res.data) {
        const baseUrl = window.location.origin
        const message = res.data.message.replace('{BASE_URL}', baseUrl)
        const phone = res.data.phone.replace(/\D/g, '') // Remove non-digits
        const whatsappUrl = `https://wa.me/90${phone}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
      }
    } catch (error) {
      console.error('WhatsApp error:', error)
    }
  }

  const markFeedbackSent = async () => {
    if (!selectedAppointment) return
    setFeedbackLoading(true)
    
    try {
      const res = await adminApi.request<Appointment>(
        `/api/admin/crm/appointments/${selectedAppointment.id}/feedback-sent`,
        { method: 'POST' }
      )
      
      if (res.data) {
        setSelectedAppointment(res.data)
        loadData()
      }
    } catch (error) {
      console.error('Error marking feedback sent:', error)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      await adminApi.exportAppointmentsCSV(filters.status || filters.lead_heat || filters.assigned_to ? {
        status: filters.status || undefined,
        lead_heat: filters.lead_heat || undefined,
        assigned_to: filters.assigned_to || undefined,
      } : undefined)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof CalendarDays; color: string }) => (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-teal-400" />
            Randevu Talepleri
          </h1>
          <p className="text-gray-400 mt-1">Müşteri taleplerini yönetin ve takip edin</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Yenile
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard label="Toplam" value={stats.total} icon={CalendarDays} color="bg-teal-500/20 text-teal-400" />
          <StatCard label="Yeni" value={stats.new} icon={AlertCircle} color="bg-blue-500/20 text-blue-400" />
          <StatCard label="İletişime Geçildi" value={stats.contacted} icon={PhoneCall} color="bg-yellow-500/20 text-yellow-400" />
          <StatCard label="Randevu Alındı" value={stats.scheduled} icon={Calendar} color="bg-purple-500/20 text-purple-400" />
          <StatCard label="Sıcak Leadler" value={stats.hot_leads} icon={Flame} color="bg-red-500/20 text-red-400" />
          <StatCard label="Bugünkü Takipler" value={stats.today_follow_ups} icon={Clock} color="bg-orange-500/20 text-orange-400" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="İsim, telefon veya e-posta ara..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
          >
            <option value="">Tüm Durumlar</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={filters.lead_heat}
            onChange={(e) => setFilters(f => ({ ...f, lead_heat: e.target.value }))}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
          >
            <option value="">Tüm Sıcaklıklar</option>
            {Object.entries(heatConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={filters.assigned_to}
            onChange={(e) => setFilters(f => ({ ...f, assigned_to: e.target.value }))}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
          >
            <option value="">Tüm Atananlar</option>
            <option value="unassigned">Atanmamış</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Talepler ({appointments.length})</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CalendarDays className="w-12 h-12 mb-4 opacity-50" />
                <p>Henüz randevu talebi yok</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50 max-h-[600px] overflow-y-auto">
                {appointments.map((appointment) => {
                  const StatusIcon = statusConfig[appointment.status]?.icon || AlertCircle
                  const HeatIcon = heatConfig[appointment.lead_heat]?.icon || Thermometer
                  const PetIcon = petTypeIcons[appointment.pet_type || ''] || Cat

                  return (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedAppointment(appointment)}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-gray-700/30 transition-colors",
                        selectedAppointment?.id === appointment.id && "bg-teal-500/10 border-l-2 border-l-teal-500"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{appointment.name}</h3>
                            <span className={cn("px-2 py-0.5 rounded-full text-xs border", statusConfig[appointment.status]?.color)}>
                              {statusConfig[appointment.status]?.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {appointment.phone}
                            </span>
                            {appointment.pet_name && (
                              <span className="flex items-center gap-1">
                                <PetIcon className="w-3.5 h-3.5" />
                                {appointment.pet_name}
                              </span>
                            )}
                          </div>
                          {appointment.message && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-1">{appointment.message}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            <HeatIcon className={cn("w-4 h-4", heatConfig[appointment.lead_heat]?.color)} />
                            <span className="text-sm font-medium text-white">{appointment.lead_score}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(appointment.created_at), { addSuffix: true, locale: tr })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedAppointment ? (
              <motion.div
                key={selectedAppointment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden sticky top-4"
              >
                <div className="p-4 border-b border-gray-700 bg-gray-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-teal-400 font-medium mb-1">Talep Detayları</p>
                      <h2 className="text-lg font-semibold text-white">{selectedAppointment.name}</h2>
                    </div>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const HeatIcon = heatConfig[selectedAppointment.lead_heat]?.icon || Thermometer
                        return <HeatIcon className={cn("w-5 h-5", heatConfig[selectedAppointment.lead_heat]?.color)} />
                      })()}
                      <span className={cn("font-bold text-lg", heatConfig[selectedAppointment.lead_heat]?.color)}>
                        {selectedAppointment.lead_score}
                      </span>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border mt-2", statusConfig[selectedAppointment.status]?.color)}>
                    {(() => {
                      const StatusIcon = statusConfig[selectedAppointment.status]?.icon || AlertCircle
                      return <StatusIcon className="w-3 h-3" />
                    })()}
                    {statusConfig[selectedAppointment.status]?.label}
                  </span>
                </div>

                <div className="p-4 space-y-5 max-h-[600px] overflow-y-auto">
                  
                  {/* HERO SECTION - Randevu Tarihi & Hizmet */}
                  <div className="bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-blue-500/20 border border-teal-500/30 rounded-2xl p-5">
                    {/* Hizmet */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">İstenen Hizmet</p>
                      <h3 className="text-2xl font-bold text-white">
                        {selectedAppointment.service_requested || 'Belirtilmemiş'}
                      </h3>
                    </div>
                    
                    {/* Tarih & Saat */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                        <CalendarDays className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Tercih Edilen Tarih</p>
                        <p className="text-lg font-bold text-white">
                          {selectedAppointment.preferred_date || 'Belirtilmemiş'}
                        </p>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                        <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 mb-1">Tercih Edilen Saat</p>
                        <p className="text-lg font-bold text-white">
                          {selectedAppointment.preferred_time || 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MÜŞTERİ BİLGİLERİ */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-400" />
                        Müşteri Bilgileri
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {selectedAppointment.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-white mb-2">{selectedAppointment.name}</h4>
                          
                          {/* İletişim Bilgileri */}
                          <div className="space-y-2">
                            <a href={`tel:${selectedAppointment.phone}`} className="flex items-center gap-3 text-teal-400 hover:text-teal-300 transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                <Phone className="w-4 h-4" />
                              </div>
                              <span className="font-medium">{selectedAppointment.phone}</span>
                            </a>
                            
                            {selectedAppointment.email && (
                              <a href={`mailto:${selectedAppointment.email}`} className="flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                  <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-sm">{selectedAppointment.email}</span>
                              </a>
                            )}
                            
                            <a href={`https://wa.me/${selectedAppointment.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" 
                               className="flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <MessageCircle className="w-4 h-4" />
                              </div>
                              <span className="font-medium">WhatsApp ile İletişim</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EVCİL HAYVAN BİLGİLERİ */}
                  {selectedAppointment.pet_name && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          {selectedAppointment.pet_type === 'kedi' ? (
                            <Cat className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Dog className="w-4 h-4 text-amber-400" />
                          )}
                          Evcil Hayvan Bilgileri
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center",
                            selectedAppointment.pet_type === 'kedi' ? "bg-amber-500/20" : "bg-orange-500/20"
                          )}>
                            {selectedAppointment.pet_type === 'kedi' ? (
                              <Cat className="w-8 h-8 text-amber-400" />
                            ) : (
                              <Dog className="w-8 h-8 text-orange-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-xl font-bold text-white">{selectedAppointment.pet_name}</p>
                            <p className="text-gray-400 capitalize">
                              {selectedAppointment.pet_type === 'kedi' ? 'Kedi' : selectedAppointment.pet_type === 'kopek' ? 'Köpek' : selectedAppointment.pet_type}
                              {selectedAppointment.pet_breed && ` • ${selectedAppointment.pet_breed}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NOT / MESAJ */}
                  {selectedAppointment.message && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          Müşteri Notu
                        </h3>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-300 leading-relaxed">{selectedAppointment.message}</p>
                      </div>
                    </div>
                  )}

                  {/* LEAD PUANI */}
                  {selectedAppointment.lead_score_reasons.length > 0 && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-400" />
                          Lead Puanı
                        </h3>
                        <span className={cn("text-xl font-bold", heatConfig[selectedAppointment.lead_heat]?.color)}>
                          {selectedAppointment.lead_score}
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        {selectedAppointment.lead_score_reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm py-1">
                            <span className="text-gray-400">{reason.description}</span>
                            <span className="text-green-400 font-medium">+{reason.points}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* İŞLEMLER */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                      <h3 className="text-sm font-semibold text-white">Hızlı İşlemler</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Durum</label>
                          <select
                            value={selectedAppointment.status}
                            onChange={(e) => handleStatusChange(selectedAppointment.id, e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                          >
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <option key={key} value={key}>{config.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Atanan Kişi</label>
                          <select
                            value={selectedAppointment.assigned_to || ''}
                            onChange={(e) => handleAssign(selectedAppointment.id, e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                          >
                            <option value="">Ata...</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>{user.full_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-400 hover:bg-teal-500/30 transition-colors font-medium"
                      >
                        <StickyNote className="w-4 h-4" />
                        Not Ekle
                      </button>
                    </div>
                  </div>

                  {/* Feedback Link Section - Only show for completed appointments */}
                  {selectedAppointment.status === 'completed' && (
                    <div className="space-y-3 p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl">
                      <h3 className="text-sm font-medium text-teal-400 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Memnuniyet Formu
                      </h3>
                      
                      {/* Feedback Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          selectedAppointment.feedback_status === 'received' && "bg-green-500/20 text-green-400",
                          selectedAppointment.feedback_status === 'sent' && "bg-yellow-500/20 text-yellow-400",
                          selectedAppointment.feedback_status === 'not_sent' && "bg-gray-500/20 text-gray-400"
                        )}>
                          {selectedAppointment.feedback_status === 'received' && '✓ Alındı'}
                          {selectedAppointment.feedback_status === 'sent' && '📤 Gönderildi'}
                          {selectedAppointment.feedback_status === 'not_sent' && '⏳ Gönderilmedi'}
                        </span>
                        {selectedAppointment.feedback_sent_at && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(selectedAppointment.feedback_sent_at), 'dd MMM HH:mm', { locale: tr })}
                          </span>
                        )}
                      </div>

                      {/* Feedback Link */}
                      {selectedAppointment.feedback_link && (
                        <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-2">
                          <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}${selectedAppointment.feedback_link}`}
                            className="flex-1 bg-transparent text-xs text-gray-300 truncate focus:outline-none"
                          />
                          <button
                            onClick={copyFeedbackLink}
                            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            title="Linki Kopyala"
                          >
                            {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <a
                            href={selectedAppointment.feedback_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            title="Linki Aç"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={openWhatsApp}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                        >
                          <Send className="w-4 h-4" />
                          WhatsApp
                        </button>
                        
                        {selectedAppointment.feedback_status !== 'received' && (
                          <button
                            onClick={markFeedbackSent}
                            disabled={feedbackLoading || selectedAppointment.feedback_status === 'sent'}
                            className={cn(
                              "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                              selectedAppointment.feedback_status === 'sent'
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-teal-500/20 border border-teal-500/30 text-teal-400 hover:bg-teal-500/30"
                            )}
                          >
                            {feedbackLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            {selectedAppointment.feedback_status === 'sent' ? 'Gönderildi' : 'Gönderildi İşaretle'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedAppointment.notes.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-400">Notlar</h3>
                      <div className="space-y-2">
                        {selectedAppointment.notes.map((note) => (
                          <div key={note.id} className="bg-gray-900/50 rounded-lg p-3">
                            <p className="text-white text-sm">{note.content}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {note.created_by_email} - {format(new Date(note.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>Oluşturulma: {format(new Date(selectedAppointment.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}</p>
                    {selectedAppointment.contacted_at && (
                      <p>İletişim: {format(new Date(selectedAppointment.contacted_at), 'dd MMM yyyy HH:mm', { locale: tr })}</p>
                    )}
                    {selectedAppointment.scheduled_at && (
                      <p>Randevu: {format(new Date(selectedAppointment.scheduled_at), 'dd MMM yyyy HH:mm', { locale: tr })}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center"
              >
                <div className="p-4 border-b border-gray-700 bg-gray-800/80 -mx-8 -mt-8 mb-6 rounded-t-xl">
                  <p className="text-xs text-teal-400 font-medium mb-1">Talep Detayları</p>
                  <h2 className="text-lg font-semibold text-white">Müşteri Bilgileri</h2>
                </div>
                <CalendarDays className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Detayları görmek için bir talep seçin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Note Modal */}
      <AnimatePresence>
        {showNoteModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Not Ekle</h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Notunuzu yazın..."
                className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Ekle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
