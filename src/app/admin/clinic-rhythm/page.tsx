'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/adminApi'
import { 
  Calendar, Plus, Search, Eye, EyeOff, Trash2, Edit, 
  Loader2, Check, X, Database, FileText, HelpCircle, 
  AlertTriangle, Copy, RefreshCw, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ClinicRhythmEntry {
  id: string
  date_key: string
  featured_question: {
    question_text: string
    short_answer: string
    related_blog_slug?: string
    related_blog_title?: string
    source_hint?: string
  } | null
  false_alarm: {
    message_title?: string
    message_body: string
    supportive_line: string
  } | null
  status: string
  created_at?: string
  updated_at?: string
  published_at?: string
}

interface PoolQuestion {
  id: string
  question_text: string
  short_answer: string
  related_blog_slug?: string | null
  related_blog_title?: string | null
  category?: string
  status: string
  usage_count: number
}

interface PoolAlarm {
  id: string
  message_title: string
  message_body: string
  supportive_line: string
  category?: string
  status: string
  usage_count: number
}

interface PoolStats {
  total_questions: number
  total_alarms: number
  active_questions: number
  active_alarms: number
  total_combinations: number
}

const statusColors = {
  draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const statusLabels = {
  draft: 'Taslak',
  published: 'Yayında',
  archived: 'Arşiv',
}

const categoryLabels: Record<string, string> = {
  kedi: 'Kedi',
  kopek: 'Köpek',
  genel: 'Genel',
  fiziksel: 'Fiziksel',
  davranissal: 'Davranışsal',
  mevsimsel: 'Mevsimsel',
}

export default function ClinicRhythmPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'entries' | 'questions' | 'alarms'>('entries')
  
  // Entries state
  const [entries, setEntries] = useState<ClinicRhythmEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ClinicRhythmEntry | null>(null)
  
  // Pool state
  const [poolQuestions, setPoolQuestions] = useState<PoolQuestion[]>([])
  const [poolAlarms, setPoolAlarms] = useState<PoolAlarm[]>([])
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null)
  const [poolLoading, setPoolLoading] = useState(false)
  const [questionSearch, setQuestionSearch] = useState('')
  const [alarmSearch, setAlarmSearch] = useState('')
  const [questionCategory, setQuestionCategory] = useState('')
  const [alarmCategory, setAlarmCategory] = useState('')
  
  // Pool edit modals
  const [editingQuestion, setEditingQuestion] = useState<PoolQuestion | null>(null)
  const [editingAlarm, setEditingAlarm] = useState<PoolAlarm | null>(null)
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false)
  const [showAddAlarmModal, setShowAddAlarmModal] = useState(false)
  
  // Selected pool items for creating entry
  const [selectedQuestion, setSelectedQuestion] = useState<PoolQuestion | null>(null)
  const [selectedAlarm, setSelectedAlarm] = useState<PoolAlarm | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getClinicRhythmEntries({
        status: statusFilter || undefined,
        limit: 50
      })
      if (res.data) {
        setEntries(res.data.entries)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('Failed to load entries:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const loadPoolData = useCallback(async () => {
    setPoolLoading(true)
    try {
      const [questionsRes, alarmsRes, statsRes] = await Promise.all([
        adminApi.getPoolQuestions({ 
          search: questionSearch || undefined,
          category: questionCategory || undefined,
          limit: 200 
        }),
        adminApi.getPoolAlarms({ 
          search: alarmSearch || undefined,
          category: alarmCategory || undefined,
          limit: 200 
        }),
        adminApi.getPoolStats()
      ])
      
      if (questionsRes.data) setPoolQuestions(questionsRes.data.questions)
      if (alarmsRes.data) setPoolAlarms(alarmsRes.data.alarms)
      if (statsRes.data) setPoolStats(statsRes.data)
    } catch (error) {
      console.error('Failed to load pool data:', error)
    } finally {
      setPoolLoading(false)
    }
  }, [questionSearch, alarmSearch, questionCategory, alarmCategory])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  useEffect(() => {
    if (activeTab !== 'entries') {
      loadPoolData()
    }
  }, [activeTab, loadPoolData])

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      await adminApi.updateClinicRhythmStatus(id, newStatus)
      loadEntries()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    try {
      await adminApi.deleteClinicRhythmEntry(id)
      loadEntries()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Bu soruyu havuzdan silmek istediğinize emin misiniz?')) return
    try {
      const res = await adminApi.deletePoolQuestion(id)
      if (res.data) {
        loadPoolData()
      } else {
        alert(res.error || 'Silme başarısız oldu')
      }
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const handleDeleteAlarm = async (id: string) => {
    if (!confirm('Bu alarmı havuzdan silmek istediğinize emin misiniz?')) return
    try {
      const res = await adminApi.deletePoolAlarm(id)
      if (res.data) {
        loadPoolData()
      } else {
        alert(res.error || 'Silme başarısız oldu')
      }
    } catch (error) {
      console.error('Failed to delete alarm:', error)
    }
  }

  const formatDate = (dateKey: string) => {
    try {
      return format(parseISO(dateKey), 'd MMMM yyyy, EEEE', { locale: tr })
    } catch {
      return dateKey
    }
  }

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Use selected pool items to create entry
  const createFromPool = () => {
    if (selectedQuestion || selectedAlarm) {
      setShowCreateModal(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Klinik İçerikleri</h1>
          <p className="text-gray-400 text-sm mt-1">Günlük soru ve yanlış alarm içerikleri</p>
        </div>
        
        {/* Stats Badge */}
        {poolStats && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 rounded-lg">
            <Database className="w-4 h-4 text-teal-400" />
            <span className="text-teal-300 text-sm">
              {poolStats.active_questions} Soru · {poolStats.active_alarms} Alarm
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('entries')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'entries' 
              ? 'bg-teal-500 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          )}
        >
          <FileText className="w-4 h-4" />
          Kayıtlar ({total})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'questions' 
              ? 'bg-teal-500 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          )}
        >
          <HelpCircle className="w-4 h-4" />
          Sorular ({poolQuestions.length})
        </button>
        <button
          onClick={() => setActiveTab('alarms')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'alarms' 
              ? 'bg-teal-500 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          Alarmlar ({poolAlarms.length})
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ENTRIES TAB */}
        {activeTab === 'entries' && (
          <motion.div
            key="entries"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setSelectedQuestion(null)
                  setSelectedAlarm(null)
                  setShowCreateModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Kayıt
              </button>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
                <option value="archived">Arşiv</option>
              </select>
            </div>

            {/* Entries List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Henüz kayıt yok</p>
                <p className="text-gray-500 text-sm mt-1">
                  Havuzdan seçim yaparak veya manuel kayıt oluşturabilirsiniz
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Date & Status */}
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-4 h-4 text-teal-400" />
                          <span className="text-white font-medium">{formatDate(entry.date_key)}</span>
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs border',
                            statusColors[entry.status as keyof typeof statusColors]
                          )}>
                            {statusLabels[entry.status as keyof typeof statusLabels]}
                          </span>
                        </div>

                        {/* Content Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Featured Question */}
                          {entry.featured_question && (
                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                              <div className="flex items-center gap-2 text-teal-400 text-xs font-medium mb-2">
                                <HelpCircle className="w-3 h-3" />
                                Günün Sorusu
                              </div>
                              <p className="text-white text-sm font-medium line-clamp-2">
                                {entry.featured_question.question_text}
                              </p>
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                                {entry.featured_question.short_answer}
                              </p>
                            </div>
                          )}

                          {/* False Alarm */}
                          {entry.false_alarm && (
                            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                              <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-2">
                                <AlertTriangle className="w-3 h-3" />
                                Yanlış Alarm
                              </div>
                              {entry.false_alarm.message_title && (
                                <p className="text-white text-sm font-medium">
                                  {entry.false_alarm.message_title}
                                </p>
                              )}
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                                {entry.false_alarm.message_body}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {entry.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(entry.id, 'published')}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Yayınla"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {entry.status === 'published' && (
                          <button
                            onClick={() => handleStatusChange(entry.id, 'draft')}
                            className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                            title="Taslağa Al"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  placeholder="Soru ara..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500"
                />
              </div>
              <select
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="kedi">Kedi</option>
                <option value="kopek">Köpek</option>
                <option value="genel">Genel</option>
              </select>
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Soru
              </button>
              <button
                onClick={loadPoolData}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Yenile"
              >
                <RefreshCw className={cn("w-4 h-4", poolLoading && "animate-spin")} />
              </button>
            </div>

            {/* Selected Question Banner */}
            {selectedQuestion && (
              <div className="flex items-center justify-between p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" />
                  <span className="text-teal-300 text-sm">
                    Seçili: &quot;{selectedQuestion.question_text.substring(0, 50)}...&quot;
                  </span>
                </div>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="p-1 text-teal-400 hover:bg-teal-500/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Questions Grid */}
            {poolLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-3">
                {poolQuestions.map((question) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "p-4 bg-gray-800/50 rounded-xl border transition-all",
                      selectedQuestion?.id === question.id 
                        ? "border-teal-500 bg-teal-500/10" 
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedQuestion(
                          selectedQuestion?.id === question.id ? null : question
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {question.category && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                              {categoryLabels[question.category] || question.category}
                            </span>
                          )}
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded",
                            question.status === 'active' 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-gray-500/20 text-gray-400"
                          )}>
                            {question.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <p className="text-white font-medium">{question.question_text}</p>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {question.short_answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(question.question_text)
                          }}
                          className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Kopyala"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingQuestion(question)
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteQuestion(question.id)
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ALARMS TAB */}
        {activeTab === 'alarms' && (
          <motion.div
            key="alarms"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={alarmSearch}
                  onChange={(e) => setAlarmSearch(e.target.value)}
                  placeholder="Alarm ara..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500"
                />
              </div>
              <select
                value={alarmCategory}
                onChange={(e) => setAlarmCategory(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="fiziksel">Fiziksel</option>
                <option value="davranissal">Davranışsal</option>
                <option value="mevsimsel">Mevsimsel</option>
              </select>
              <button
                onClick={() => setShowAddAlarmModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Alarm
              </button>
              <button
                onClick={loadPoolData}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Yenile"
              >
                <RefreshCw className={cn("w-4 h-4", poolLoading && "animate-spin")} />
              </button>
            </div>

            {/* Selected Alarm Banner */}
            {selectedAlarm && (
              <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-sm">
                    Seçili: &quot;{selectedAlarm.message_title}&quot;
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAlarm(null)}
                  className="p-1 text-amber-400 hover:bg-amber-500/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Alarms Grid */}
            {poolLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-3">
                {poolAlarms.map((alarm) => (
                  <motion.div
                    key={alarm.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "p-4 bg-gray-800/50 rounded-xl border transition-all",
                      selectedAlarm?.id === alarm.id 
                        ? "border-amber-500 bg-amber-500/10" 
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedAlarm(
                          selectedAlarm?.id === alarm.id ? null : alarm
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {alarm.category && (
                            <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                              {categoryLabels[alarm.category] || alarm.category}
                            </span>
                          )}
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded",
                            alarm.status === 'active' 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-gray-500/20 text-gray-400"
                          )}>
                            {alarm.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <p className="text-white font-medium">{alarm.message_title}</p>
                        <p className="text-gray-400 text-sm mt-1">{alarm.message_body}</p>
                        <p className="text-green-400/70 text-xs mt-2 italic">
                          💚 {alarm.supportive_line}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(`${alarm.message_title}: ${alarm.message_body}`)
                          }}
                          className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Kopyala"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingAlarm(alarm)
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAlarm(alarm.id)
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action - Create from Selection */}
      {(selectedQuestion || selectedAlarm) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={createFromPool}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/30 hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Seçimden Kayıt Oluştur
          </button>
        </motion.div>
      )}

      {/* Create/Edit Entry Modal */}
      <AnimatePresence>
        {(showCreateModal || editingEntry) && (
          <CreateEditEntryModal
            entry={editingEntry}
            selectedQuestion={selectedQuestion}
            selectedAlarm={selectedAlarm}
            onClose={() => {
              setShowCreateModal(false)
              setEditingEntry(null)
              setSelectedQuestion(null)
              setSelectedAlarm(null)
            }}
            onSave={() => {
              setShowCreateModal(false)
              setEditingEntry(null)
              setSelectedQuestion(null)
              setSelectedAlarm(null)
              loadEntries()
            }}
          />
        )}
      </AnimatePresence>

      {/* Question Edit Modal */}
      <AnimatePresence>
        {(editingQuestion || showAddQuestionModal) && (
          <QuestionEditModal
            question={editingQuestion}
            onClose={() => {
              setEditingQuestion(null)
              setShowAddQuestionModal(false)
            }}
            onSave={() => {
              setEditingQuestion(null)
              setShowAddQuestionModal(false)
              loadPoolData()
            }}
          />
        )}
      </AnimatePresence>

      {/* Alarm Edit Modal */}
      <AnimatePresence>
        {(editingAlarm || showAddAlarmModal) && (
          <AlarmEditModal
            alarm={editingAlarm}
            onClose={() => {
              setEditingAlarm(null)
              setShowAddAlarmModal(false)
            }}
            onSave={() => {
              setEditingAlarm(null)
              setShowAddAlarmModal(false)
              loadPoolData()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Create/Edit Entry Modal Component
function CreateEditEntryModal({ 
  entry, 
  selectedQuestion,
  selectedAlarm,
  onClose, 
  onSave 
}: { 
  entry: ClinicRhythmEntry | null
  selectedQuestion: PoolQuestion | null
  selectedAlarm: PoolAlarm | null
  onClose: () => void
  onSave: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [dateKey, setDateKey] = useState(entry?.date_key || format(new Date(), 'yyyy-MM-dd'))
  
  // Question fields
  const [questionText, setQuestionText] = useState(
    entry?.featured_question?.question_text || selectedQuestion?.question_text || ''
  )
  const [shortAnswer, setShortAnswer] = useState(
    entry?.featured_question?.short_answer || selectedQuestion?.short_answer || ''
  )
  const [blogSlug, setBlogSlug] = useState(entry?.featured_question?.related_blog_slug || '')
  const [blogTitle, setBlogTitle] = useState(entry?.featured_question?.related_blog_title || '')
  
  // Alarm fields
  const [alarmTitle, setAlarmTitle] = useState(
    entry?.false_alarm?.message_title || selectedAlarm?.message_title || ''
  )
  const [alarmBody, setAlarmBody] = useState(
    entry?.false_alarm?.message_body || selectedAlarm?.message_body || ''
  )
  const [alarmSupport, setAlarmSupport] = useState(
    entry?.false_alarm?.supportive_line || selectedAlarm?.supportive_line || ''
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        date_key: dateKey,
        featured_question: questionText ? {
          question_text: questionText,
          short_answer: shortAnswer,
          related_blog_slug: blogSlug || null,
          related_blog_title: blogTitle || null
        } : null,
        false_alarm: alarmBody ? {
          message_title: alarmTitle || null,
          message_body: alarmBody,
          supportive_line: alarmSupport || 'Şüphede kalırsanız veterinerinize danışın.'
        } : null,
      }

      if (entry) {
        await adminApi.updateClinicRhythmEntry(entry.id, data)
      } else {
        await adminApi.createClinicRhythmEntry(data)
      }
      onSave()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Kaydetme başarısız oldu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {entry ? 'Kayıt Düzenle' : 'Yeni Kayıt'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tarih
            </label>
            <input
              type="date"
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          {/* Featured Question */}
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <h3 className="flex items-center gap-2 text-teal-400 font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              Günün Sorusu
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Soru</label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Kedim neden çok uyuyor?"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kısa Cevap</label>
                <textarea
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  placeholder="Cevabı buraya yazın..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Blog Slug (opsiyonel)</label>
                  <input
                    type="text"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    placeholder="kedi-bakimi"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Blog Başlığı (opsiyonel)</label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="Kedi Bakımı Rehberi"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* False Alarm */}
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <h3 className="flex items-center gap-2 text-amber-400 font-medium mb-4">
              <AlertTriangle className="w-4 h-4" />
              Yanlış Alarm
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Başlık</label>
                <input
                  type="text"
                  value={alarmTitle}
                  onChange={(e) => setAlarmTitle(e.target.value)}
                  placeholder="Kuru Burun"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mesaj</label>
                <textarea
                  value={alarmBody}
                  onChange={(e) => setAlarmBody(e.target.value)}
                  placeholder="Köpeğinizin burnu kuru olabilir..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Destek Mesajı</label>
                <textarea
                  value={alarmSupport}
                  onChange={(e) => setAlarmSupport(e.target.value)}
                  placeholder="Endişelenmeyin! Bu genellikle..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {entry ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Question Edit Modal
function QuestionEditModal({ 
  question, 
  onClose, 
  onSave 
}: { 
  question: PoolQuestion | null
  onClose: () => void
  onSave: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [questionText, setQuestionText] = useState(question?.question_text || '')
  const [shortAnswer, setShortAnswer] = useState(question?.short_answer || '')
  const [category, setCategory] = useState(question?.category || '')
  const [status, setStatus] = useState(question?.status || 'active')

  const handleSave = async () => {
    if (!questionText || !shortAnswer) {
      alert('Soru ve cevap zorunludur')
      return
    }

    setSaving(true)
    try {
      if (question) {
        await adminApi.updatePoolQuestion(question.id, {
          question_text: questionText,
          short_answer: shortAnswer,
          category: category || undefined,
          status
        })
      } else {
        await adminApi.createPoolQuestion({
          question_text: questionText,
          short_answer: shortAnswer,
          category: category || undefined
        })
      }
      onSave()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Kaydetme başarısız oldu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {question ? 'Soru Düzenle' : 'Yeni Soru'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Soru *</label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Kedim neden çok uyuyor?"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kısa Cevap *</label>
            <textarea
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              placeholder="Kediler günde 12-16 saat uyur..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="">Seçiniz</option>
                <option value="kedi">Kedi</option>
                <option value="kopek">Köpek</option>
                <option value="genel">Genel</option>
              </select>
            </div>
            {question && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {question ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Alarm Edit Modal
function AlarmEditModal({ 
  alarm, 
  onClose, 
  onSave 
}: { 
  alarm: PoolAlarm | null
  onClose: () => void
  onSave: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [messageTitle, setMessageTitle] = useState(alarm?.message_title || '')
  const [messageBody, setMessageBody] = useState(alarm?.message_body || '')
  const [supportiveLine, setSupportiveLine] = useState(alarm?.supportive_line || '')
  const [category, setCategory] = useState(alarm?.category || '')
  const [status, setStatus] = useState(alarm?.status || 'active')

  const handleSave = async () => {
    if (!messageTitle || !messageBody || !supportiveLine) {
      alert('Başlık, mesaj ve destek mesajı zorunludur')
      return
    }

    setSaving(true)
    try {
      if (alarm) {
        await adminApi.updatePoolAlarm(alarm.id, {
          message_title: messageTitle,
          message_body: messageBody,
          supportive_line: supportiveLine,
          category: category || undefined,
          status
        })
      } else {
        await adminApi.createPoolAlarm({
          message_title: messageTitle,
          message_body: messageBody,
          supportive_line: supportiveLine,
          category: category || undefined
        })
      }
      onSave()
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Kaydetme başarısız oldu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {alarm ? 'Alarm Düzenle' : 'Yeni Alarm'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Başlık *</label>
            <input
              type="text"
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
              placeholder="Kuru Burun"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mesaj *</label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Köpeğinizin burnu kuru olabilir, ancak bu her zaman hastalık demek değildir."
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Destek Mesajı *</label>
            <textarea
              value={supportiveLine}
              onChange={(e) => setSupportiveLine(e.target.value)}
              placeholder="Uyku sonrası veya sıcak havalarda normaldir. Sürekli kuruluk varsa veterinere danışın."
              rows={2}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="">Seçiniz</option>
                <option value="fiziksel">Fiziksel</option>
                <option value="davranissal">Davranışsal</option>
                <option value="mevsimsel">Mevsimsel</option>
              </select>
            </div>
            {alarm && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {alarm ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
