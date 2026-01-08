'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  UsersRound, Plus, Search, MoreVertical, Edit, Trash2, Eye, EyeOff,
  RotateCcw, X, Check, AlertCircle, GripVertical, Upload, Camera,
  ExternalLink, Archive, Crown, Star, Calendar, Phone, Mail,
  Linkedin, Instagram, GraduationCap, Award, Clock, Grid, List,
  ChevronDown, ChevronUp, Building2, User
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { useAuthStore } from '@/lib/adminAuth'
import { cn } from '@/lib/utils'
import Cropper from 'react-easy-crop'
import { useDropzone } from 'react-dropzone'

// Types
interface Education {
  degree: string
  institution: string
  year?: string
  field?: string
}

interface Certification {
  name: string
  issuer?: string
  year?: string
}

interface WorkingSchedule {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

interface SocialLinks {
  instagram?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  website?: string
}

interface TeamMember {
  id: string
  full_name: string
  slug: string
  role_title: string
  department?: string
  specialties: string[]
  bio?: string
  short_bio?: string
  photo_url: string
  photo_alt?: string
  photo_thumbnail?: string
  email?: string
  phone?: string
  social_links: SocialLinks
  experience?: string
  experience_years?: number
  quote?: string
  education: Education[]
  certifications: Certification[]
  working_schedule?: WorkingSchedule
  accepts_appointments: boolean
  is_owner: boolean
  is_featured: boolean
  show_contact_info: boolean
  status: string
  sort_order: number
  archived_at: string | null
  created_at: string
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  draft: { label: 'Taslak', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  published: { label: 'Yayında', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
}

const DAYS_TR: Record<string, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar'
}

const DEPARTMENTS = [
  { value: '', label: 'Seçiniz' },
  { value: 'veteriner', label: 'Veteriner Hekimler' },
  { value: 'cerrahi', label: 'Cerrahi' },
  { value: 'dahiliye', label: 'Dahiliye' },
  { value: 'laboratuvar', label: 'Laboratuvar' },
  { value: 'idari', label: 'İdari Kadro' },
  { value: 'destek', label: 'Destek Personeli' },
]

export default function AdminTeamPage() {
  const { user } = useAuthStore()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'professional' | 'schedule' | 'photo'>('basic')
  
  // Photo upload states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [showCropper, setShowCropper] = useState(false)

  // Form state with all new fields
  const [form, setForm] = useState({
    full_name: '',
    slug: '',
    role_title: '',
    department: '',
    specialties: '',
    bio: '',
    short_bio: '',
    photo_url: '',
    photo_thumbnail: '',
    email: '',
    phone: '',
    experience: '',
    experience_years: 0,
    quote: '',
    is_owner: false,
    is_featured: false,
    accepts_appointments: true,
    show_contact_info: true,
    status: 'draft',
    social_links: { instagram: '', linkedin: '', twitter: '', facebook: '', website: '' },
    education: [] as Education[],
    certifications: [] as Certification[],
    working_schedule: {
      monday: '09:00-18:00',
      tuesday: '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday: '09:00-18:00',
      friday: '09:00-18:00',
      saturday: '',
      sunday: ''
    } as WorkingSchedule
  })

  // Load members
  useEffect(() => {
    loadMembers()
  }, [showArchived])

  const loadMembers = async () => {
    setLoading(true)
    const response = await adminApi.getTeamMembers(1, 100, { archived: showArchived })
    if (response.data) {
      const sorted = response.data.team_members.sort((a: TeamMember, b: TeamMember) => a.sort_order - b.sort_order)
      setMembers(sorted)
    }
    setLoading(false)
  }

  // Reset form
  const resetForm = () => {
    setForm({
      full_name: '',
      slug: '',
      role_title: '',
      department: '',
      specialties: '',
      bio: '',
      short_bio: '',
      photo_url: '',
      photo_thumbnail: '',
      email: '',
      phone: '',
      experience: '',
      experience_years: 0,
      quote: '',
      is_owner: false,
      is_featured: false,
      accepts_appointments: true,
      show_contact_info: true,
      status: 'draft',
      social_links: { instagram: '', linkedin: '', twitter: '', facebook: '', website: '' },
      education: [],
      certifications: [],
      working_schedule: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '09:00-18:00',
        thursday: '09:00-18:00',
        friday: '09:00-18:00',
        saturday: '',
        sunday: ''
      }
    })
    setUploadedImage(null)
    setActiveTab('basic')
  }

  // Photo upload with dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // Create cropped image and upload
  const handleCropSave = async () => {
    if (!uploadedImage || !croppedAreaPixels) return
    
    try {
      setFormLoading(true)
      
      // Create canvas to crop image
      const image = new Image()
      image.src = uploadedImage
      await new Promise((resolve) => { image.onload = resolve })
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height
      
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      )
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9)
      })
      
      // Upload to gallery
      const formData = new FormData()
      formData.append('file', blob, `team-${Date.now()}.jpg`)
      formData.append('album_slug', 'ekip')
      formData.append('title', form.full_name || 'Ekip Üyesi')
      
      const response = await adminApi.uploadGalleryImage(formData)
      
      if (response.data?.url) {
        setForm(prev => ({ ...prev, photo_url: response.data.url }))
        setMessage({ type: 'success', text: 'Fotoğraf yüklendi!' })
      } else {
        throw new Error(response.error || 'Yükleme başarısız')
      }
      
      setShowCropper(false)
      setUploadedImage(null)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Fotoğraf yüklenemedi' })
    } finally {
      setFormLoading(false)
    }
  }

  // Form handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.photo_url) {
      setMessage({ type: 'error', text: 'Lütfen bir fotoğraf yükleyin' })
      setActiveTab('photo')
      return
    }
    
    setFormLoading(true)
    
    const payload = {
      ...form,
      slug: form.slug || undefined,
      specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      social_links: Object.values(form.social_links).some(v => v) ? form.social_links : undefined,
      education: form.education.length > 0 ? form.education : [],
      certifications: form.certifications.length > 0 ? form.certifications : [],
      working_schedule: form.accepts_appointments ? form.working_schedule : undefined
    }
    
    const response = await adminApi.createTeamMember(payload)
    
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Ekip üyesi oluşturuldu' })
      setShowModal(false)
      resetForm()
      loadMembers()
    }
    setFormLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return
    setFormLoading(true)
    
    const payload = {
      ...form,
      specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      social_links: Object.values(form.social_links).some(v => v) ? form.social_links : undefined,
      education: form.education,
      certifications: form.certifications,
      working_schedule: form.accepts_appointments ? form.working_schedule : undefined
    }
    
    const response = await adminApi.updateTeamMember(editingMember.id, payload)
    
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Ekip üyesi güncellendi' })
      setEditingMember(null)
      setShowModal(false)
      resetForm()
      loadMembers()
    }
    setFormLoading(false)
  }

  const handleStatusToggle = async (member: TeamMember) => {
    const newStatus = member.status === 'published' ? 'draft' : 'published'
    const response = await adminApi.updateTeamMemberStatus(member.id, newStatus)
    
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: `Ekip üyesi ${newStatus === 'published' ? 'yayınlandı' : 'taslağa alındı'}` })
      loadMembers()
    }
    setActiveMenu(null)
  }

  const handleArchive = async (member: TeamMember) => {
    if (!confirm(`"${member.full_name}" ekip üyesini arşivlemek istediğinize emin misiniz?`)) return
    
    const response = await adminApi.deleteTeamMember(member.id)
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Ekip üyesi arşivlendi' })
      loadMembers()
    }
    setActiveMenu(null)
  }

  const handleRestore = async (member: TeamMember) => {
    const response = await adminApi.restoreTeamMember(member.id)
    if (response.error) {
      setMessage({ type: 'error', text: response.error })
    } else {
      setMessage({ type: 'success', text: 'Ekip üyesi geri yüklendi' })
      loadMembers()
    }
    setActiveMenu(null)
  }

  // Drag & drop reorder
  const handleReorder = async (newOrder: TeamMember[]) => {
    setMembers(newOrder)
    
    const items = newOrder.map((m, index) => ({ id: m.id, sort_order: index }))
    await adminApi.reorderTeamMembers(items)
  }

  const openEditModal = async (member: TeamMember) => {
    const response = await adminApi.getTeamMemberById(member.id)
    if (response.data) {
      const m = response.data
      setForm({
        full_name: m.full_name,
        slug: m.slug,
        role_title: m.role_title,
        department: m.department || '',
        specialties: m.specialties?.join(', ') || '',
        bio: m.bio || '',
        short_bio: m.short_bio || '',
        photo_url: m.photo_url,
        photo_thumbnail: m.photo_thumbnail || '',
        email: m.email || '',
        phone: m.phone || '',
        experience: m.experience || '',
        experience_years: m.experience_years || 0,
        quote: m.quote || '',
        is_owner: m.is_owner,
        is_featured: m.is_featured || false,
        accepts_appointments: m.accepts_appointments ?? true,
        show_contact_info: m.show_contact_info ?? true,
        status: m.status,
        social_links: {
          instagram: m.social_links?.instagram || '',
          linkedin: m.social_links?.linkedin || '',
          twitter: m.social_links?.twitter || '',
          facebook: m.social_links?.facebook || '',
          website: m.social_links?.website || ''
        },
        education: m.education || [],
        certifications: m.certifications || [],
        working_schedule: m.working_schedule || {
          monday: '09:00-18:00',
          tuesday: '09:00-18:00',
          wednesday: '09:00-18:00',
          thursday: '09:00-18:00',
          friday: '09:00-18:00',
          saturday: '',
          sunday: ''
        }
      })
      setEditingMember(member)
      setShowModal(true)
    }
    setActiveMenu(null)
  }

  // Education & Certification handlers
  const addEducation = () => {
    setForm(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', field: '' }]
    }))
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setForm(prev => ({
      ...prev,
      education: prev.education.map((e, i) => i === index ? { ...e, [field]: value } : e)
    }))
  }

  const removeEducation = (index: number) => {
    setForm(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const addCertification = () => {
    setForm(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: '' }]
    }))
  }

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }))
  }

  const removeCertification = (index: number) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.role_title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = !departmentFilter || m.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  // Auto-hide message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

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
              'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg',
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
            <UsersRound className="w-7 h-7 text-teal-400" />
            Ekip Yönetimi
          </h1>
          <p className="text-gray-400 mt-1">
            {members.length} ekip üyesi · {members.filter(m => m.status === 'published').length} yayında
          </p>
        </div>
        
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Yeni Ekip Üyesi
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ekip üyesi ara..."
            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
          />
        </div>
        
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
        >
          <option value="">Tüm Departmanlar</option>
          {DEPARTMENTS.slice(1).map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors',
            showArchived
              ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
              : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-white'
          )}
        >
          <Archive className="w-5 h-5" />
          {showArchived ? 'Arşivlenmiş' : 'Arşivi Göster'}
        </button>

        <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-teal-500 text-white' : 'text-gray-400 hover:text-white'
            )}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Team Members */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
          <UsersRound className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{showArchived ? 'Arşivlenmiş ekip üyesi yok' : 'Ekip üyesi bulunamadı'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View with Drag & Drop
        <Reorder.Group
          axis="y"
          values={filteredMembers}
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMembers.map((member) => (
            <Reorder.Item
              key={member.id}
              value={member}
              className="cursor-grab active:cursor-grabbing"
            >
              <motion.div
                layout
                className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group"
              >
                {/* Photo & Quick Actions */}
                <div className="relative aspect-[4/3] bg-gray-800">
                  <img
                    src={member.photo_url}
                    alt={member.full_name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Drag Handle */}
                  {!showArchived && (
                    <div className="absolute top-3 left-3 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {member.is_owner && (
                      <div className="p-2 bg-yellow-500/90 rounded-lg" title="Kurucu">
                        <Crown className="w-4 h-4 text-black" />
                      </div>
                    )}
                    {member.is_featured && (
                      <div className="p-2 bg-purple-500/90 rounded-lg" title="Öne Çıkan">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Status */}
                  <div className="absolute bottom-3 left-3">
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
                      STATUS_BADGES[member.status]?.color || 'bg-gray-500/20 text-gray-400'
                    )}>
                      {STATUS_BADGES[member.status]?.label || member.status}
                    </span>
                  </div>
                  
                  {/* Menu */}
                  <div className="absolute bottom-3 right-3">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenu(activeMenu === member.id ? null : member.id)
                        }}
                        className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === member.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 bottom-full mb-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden"
                          >
                            {!showArchived ? (
                              <>
                                <button
                                  onClick={() => openEditModal(member)}
                                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4" /> Düzenle
                                </button>
                                <button
                                  onClick={() => handleStatusToggle(member)}
                                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700"
                                >
                                  {member.status === 'published' ? (
                                    <><EyeOff className="w-4 h-4" /> Yayından Kaldır</>
                                  ) : (
                                    <><Eye className="w-4 h-4" /> Yayınla</>
                                  )}
                                </button>
                                <a
                                  href={`/ekibimiz/${member.slug}`}
                                  target="_blank"
                                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700"
                                >
                                  <ExternalLink className="w-4 h-4" /> Önizle
                                </a>
                                <button
                                  onClick={() => handleArchive(member)}
                                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" /> Arşivle
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestore(member)}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-green-400 hover:bg-green-500/10"
                              >
                                <RotateCcw className="w-4 h-4" /> Geri Yükle
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg">{member.full_name}</h3>
                  <p className="text-teal-400 text-sm">{member.role_title}</p>
                  
                  {member.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.specialties.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                          {s}
                        </span>
                      ))}
                      {member.specialties.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs rounded">
                          +{member.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {member.experience && (
                    <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {member.experience}
                    </p>
                  )}
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        // List View
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="w-12 py-4 px-2"></th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Ekip Üyesi</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Unvan / Departman</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">İletişim</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Durum</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-4 px-2">
                      <GripVertical className="w-4 h-4 text-gray-600" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{member.full_name}</p>
                            {member.is_owner && <Crown className="w-4 h-4 text-yellow-400" />}
                            {member.is_featured && <Star className="w-4 h-4 text-purple-400" />}
                          </div>
                          <p className="text-sm text-gray-500">{member.experience || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-white">{member.role_title}</p>
                      <p className="text-sm text-gray-500">
                        {DEPARTMENTS.find(d => d.value === member.department)?.label || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      {member.email && (
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {member.email}
                        </p>
                      )}
                      {member.phone && (
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {member.phone}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium border',
                        STATUS_BADGES[member.status]?.color || 'bg-gray-500/20 text-gray-400'
                      )}>
                        {STATUS_BADGES[member.status]?.label || member.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(member)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        >
                          {member.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        {!showArchived ? (
                          <button
                            onClick={() => handleArchive(member)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(member)}
                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowModal(false); setEditingMember(null); resetForm() }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white">
                  {editingMember ? 'Ekip Üyesi Düzenle' : 'Yeni Ekip Üyesi'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); setEditingMember(null); resetForm() }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { id: 'photo', label: 'Fotoğraf', icon: Camera },
                  { id: 'basic', label: 'Temel Bilgiler', icon: User },
                  { id: 'professional', label: 'Mesleki', icon: GraduationCap },
                  { id: 'schedule', label: 'Çalışma Saatleri', icon: Calendar },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'text-teal-400 border-b-2 border-teal-400 -mb-[2px]'
                        : 'text-gray-400 hover:text-white'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Form Content */}
              <form onSubmit={editingMember ? handleUpdate : handleCreate} className="flex-1 overflow-y-auto p-6">
                {/* Photo Tab */}
                {activeTab === 'photo' && (
                  <div className="space-y-6">
                    {/* Dimension Info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Camera className="w-3 h-3" />
                      <span>Hedef boyut: 400x533px (3:4 Dikey Portre)</span>
                    </div>
                    
                    {showCropper && uploadedImage ? (
                      <div className="space-y-4">
                        <div className="relative h-96 bg-gray-800 rounded-xl overflow-hidden">
                          <Cropper
                            image={uploadedImage}
                            crop={crop}
                            zoom={zoom}
                            aspect={3/4}
                            showGrid={true}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-sm">Yakınlaştır:</span>
                          <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => { setShowCropper(false); setUploadedImage(null) }}
                            className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700"
                          >
                            İptal
                          </button>
                          <button
                            type="button"
                            onClick={handleCropSave}
                            disabled={formLoading}
                            className="flex-1 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50"
                          >
                            {formLoading ? 'Yükleniyor...' : 'Kaydet'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Current Photo */}
                        {form.photo_url && (
                          <div className="flex justify-center mb-6">
                            <div className="relative">
                              <img
                                src={form.photo_url}
                                alt="Profil"
                                className="w-40 h-52 rounded-xl object-cover border-4 border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, photo_url: '' }))}
                                className="absolute -top-2 -right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Dropzone */}
                        <div
                          {...getRootProps()}
                          className={cn(
                            'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors',
                            isDragActive
                              ? 'border-teal-500 bg-teal-500/10'
                              : 'border-gray-700 hover:border-gray-600'
                          )}
                        >
                          <input {...getInputProps()} />
                          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-white font-medium">
                            {isDragActive ? 'Fotoğrafı buraya bırakın...' : 'Fotoğraf yüklemek için tıklayın veya sürükleyin'}
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            JPG, PNG veya WebP · Maks 5MB · Dikey portre fotoğrafları önerilir
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Ad Soyad *</label>
                        <input
                          type="text"
                          value={form.full_name}
                          onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Slug (URL)</label>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="Otomatik oluşturulur"
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Unvan *</label>
                        <input
                          type="text"
                          value={form.role_title}
                          onChange={(e) => setForm(prev => ({ ...prev, role_title: e.target.value }))}
                          placeholder="Veteriner Hekim"
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Departman</label>
                        <select
                          value={form.department}
                          onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                        >
                          {DEPARTMENTS.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Kısa Biyografi (Kart için)</label>
                      <input
                        type="text"
                        value={form.short_bio}
                        onChange={(e) => setForm(prev => ({ ...prev, short_bio: e.target.value.slice(0, 150) }))}
                        placeholder="Maks 150 karakter"
                        maxLength={150}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      />
                      <p className="text-gray-500 text-xs mt-1">{form.short_bio.length}/150</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Biyografi (Detay sayfası)</label>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Kişisel Söz</label>
                      <input
                        type="text"
                        value={form.quote}
                        onChange={(e) => setForm(prev => ({ ...prev, quote: e.target.value }))}
                        placeholder="Dostlarınızın sağlığı, bizim önceliğimiz."
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Telefon</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                          <Instagram className="w-4 h-4" /> Instagram
                        </label>
                        <input
                          type="url"
                          value={form.social_links.instagram}
                          onChange={(e) => setForm(prev => ({ ...prev, social_links: { ...prev.social_links, instagram: e.target.value } }))}
                          placeholder="https://instagram.com/..."
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                          <Linkedin className="w-4 h-4" /> LinkedIn
                        </label>
                        <input
                          type="url"
                          value={form.social_links.linkedin}
                          onChange={(e) => setForm(prev => ({ ...prev, social_links: { ...prev.social_links, linkedin: e.target.value } }))}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_owner}
                          onChange={(e) => setForm(prev => ({ ...prev, is_owner: e.target.checked }))}
                          className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-teal-500"
                        />
                        <span className="text-gray-300 text-sm flex items-center gap-1">
                          <Crown className="w-4 h-4 text-yellow-400" /> Kurucu
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_featured}
                          onChange={(e) => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-teal-500"
                        />
                        <span className="text-gray-300 text-sm flex items-center gap-1">
                          <Star className="w-4 h-4 text-purple-400" /> Öne Çıkan
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.show_contact_info}
                          onChange={(e) => setForm(prev => ({ ...prev, show_contact_info: e.target.checked }))}
                          className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-teal-500"
                        />
                        <span className="text-gray-300 text-sm">İletişimi Göster</span>
                      </label>
                      <div>
                        <select
                          value={form.status}
                          onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
                        >
                          <option value="draft">Taslak</option>
                          <option value="published">Yayında</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Professional Tab */}
                {activeTab === 'professional' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Uzmanlık Alanları</label>
                        <input
                          type="text"
                          value={form.specialties}
                          onChange={(e) => setForm(prev => ({ ...prev, specialties: e.target.value }))}
                          placeholder="Cerrahi, Ortopedi (virgülle ayırın)"
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Deneyim</label>
                          <input
                            type="text"
                            value={form.experience}
                            onChange={(e) => setForm(prev => ({ ...prev, experience: e.target.value }))}
                            placeholder="15+ Yıl"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Yıl (sayı)</label>
                          <input
                            type="number"
                            value={form.experience_years || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                            placeholder="15"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Education */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm text-gray-400 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" /> Eğitim Geçmişi
                        </label>
                        <button
                          type="button"
                          onClick={addEducation}
                          className="text-teal-400 text-sm hover:text-teal-300"
                        >
                          + Ekle
                        </button>
                      </div>
                      {form.education.map((edu, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="Derece"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
                          />
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            placeholder="Kurum"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
                          />
                          <input
                            type="text"
                            value={edu.year || ''}
                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                            placeholder="Yıl"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Certifications */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm text-gray-400 flex items-center gap-2">
                          <Award className="w-4 h-4" /> Sertifikalar
                        </label>
                        <button
                          type="button"
                          onClick={addCertification}
                          className="text-teal-400 text-sm hover:text-teal-300"
                        >
                          + Ekle
                        </button>
                      </div>
                      {form.certifications.map((cert, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                            placeholder="Sertifika Adı"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
                          />
                          <input
                            type="text"
                            value={cert.issuer || ''}
                            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                            placeholder="Veren Kurum"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
                          />
                          <input
                            type="text"
                            value={cert.year || ''}
                            onChange={(e) => updateCertification(index, 'year', e.target.value)}
                            placeholder="Yıl"
                            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                  <div className="space-y-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.accepts_appointments}
                        onChange={(e) => setForm(prev => ({ ...prev, accepts_appointments: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-teal-500"
                      />
                      <span className="text-white">Randevu kabul ediyor</span>
                    </label>
                    
                    {form.accepts_appointments && (
                      <div className="space-y-3">
                        <p className="text-gray-400 text-sm">Çalışma saatlerini girin (boş bırakılırsa o gün çalışmıyor demektir)</p>
                        {Object.entries(DAYS_TR).map(([key, label]) => (
                          <div key={key} className="flex items-center gap-4">
                            <span className="w-24 text-gray-300">{label}</span>
                            <input
                              type="text"
                              value={form.working_schedule[key as keyof WorkingSchedule] || ''}
                              onChange={(e) => setForm(prev => ({
                                ...prev,
                                working_schedule: { ...prev.working_schedule, [key]: e.target.value }
                              }))}
                              placeholder="09:00-18:00"
                              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:border-teal-500 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-800">
                <button
                  type="submit"
                  disabled={formLoading}
                  onClick={editingMember ? handleUpdate : handleCreate}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Kaydediliyor...' : (editingMember ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
