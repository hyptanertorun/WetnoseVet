import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { 
  Appointment, 
  AppointmentStatus, 
  LeadHeat, 
  AppointmentNote,
  LeadScoreReason 
} from '@/lib/models/types'

export class AppointmentService {
  // Calculate lead score
  static calculateLeadScore(appointment: Partial<Appointment>): {
    score: number
    heat: LeadHeat
    reasons: LeadScoreReason[]
  } {
    let score = 50 // Base score
    const reasons: LeadScoreReason[] = []
    
    // Email provided +10
    if (appointment.email) {
      score += 10
      reasons.push({ factor: 'email', points: 10, description: 'E-posta adresi mevcut' })
    }
    
    // Pet info provided +15
    if (appointment.pet_name && appointment.pet_type) {
      score += 15
      reasons.push({ factor: 'pet_info', points: 15, description: 'Evcil hayvan bilgileri tam' })
    }
    
    // Service requested +10
    if (appointment.service_requested) {
      score += 10
      reasons.push({ factor: 'service', points: 10, description: 'Hizmet belirtilmiş' })
    }
    
    // Preferred date +15
    if (appointment.preferred_date) {
      score += 15
      reasons.push({ factor: 'date', points: 15, description: 'Tarih tercihi var' })
    }
    
    // Detailed message +10
    if (appointment.message && appointment.message.length > 50) {
      score += 10
      reasons.push({ factor: 'message', points: 10, description: 'Detaylı mesaj' })
    }
    
    // Determine heat
    let heat: LeadHeat = 'cold'
    if (score >= 80) heat = 'hot'
    else if (score >= 60) heat = 'warm'
    
    return { score, heat, reasons }
  }
  
  // Create appointment
  static async create(data: {
    name: string
    phone: string
    email?: string
    pet_name?: string
    pet_type?: string
    pet_breed?: string
    service_requested?: string
    preferred_date?: string
    preferred_time?: string
    message?: string
    source?: string
  }): Promise<Appointment> {
    const appointmentsCollection = await getCollection<Appointment>(COLLECTIONS.APPOINTMENTS)
    
    const { score, heat, reasons } = this.calculateLeadScore(data)
    
    const now = new Date()
    const appointment: Appointment = {
      id: uuidv4(),
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      pet_name: data.pet_name || null,
      pet_type: data.pet_type || null,
      pet_breed: data.pet_breed || null,
      service_requested: data.service_requested || null,
      preferred_date: data.preferred_date || null,
      preferred_time: data.preferred_time || null,
      message: data.message || null,
      source: data.source || 'website',
      status: 'new',
      assigned_to: null,
      assigned_to_email: null,
      follow_up_at: null,
      notes: [],
      lead_score: score,
      lead_heat: heat,
      lead_score_reasons: reasons,
      created_at: now,
      updated_at: now,
      contacted_at: null,
      scheduled_at: null,
      completed_at: null,
      feedback_sent: false,
      feedback_received: false
    }
    
    await appointmentsCollection.insertOne(appointment)
    return appointment
  }
  
  // Get all appointments (admin)
  static async list(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      status?: AppointmentStatus
      lead_heat?: LeadHeat
      assigned_to?: string
      search?: string
      sort_by?: string
      sort_order?: string
    }
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const appointmentsCollection = await getCollection<Appointment>(COLLECTIONS.APPOINTMENTS)
    
    const filter: Record<string, unknown> = {}
    
    if (filters?.status) {
      filter.status = filters.status
    }
    if (filters?.lead_heat) {
      filter.lead_heat = filters.lead_heat
    }
    if (filters?.assigned_to) {
      filter.assigned_to = filters.assigned_to
    }
    if (filters?.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { pet_name: { $regex: filters.search, $options: 'i' } }
      ]
    }
    
    const sortField = filters?.sort_by || 'created_at'
    const sortOrder = filters?.sort_order === 'asc' ? 1 : -1
    
    const total = await appointmentsCollection.countDocuments(filter)
    const appointments = await appointmentsCollection
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()
    
    return { appointments, total }
  }
  
  // Get by ID
  static async getById(id: string): Promise<Appointment | null> {
    const appointmentsCollection = await getCollection<Appointment>(COLLECTIONS.APPOINTMENTS)
    return appointmentsCollection.findOne({ id })
  }
  
  // Update appointment
  static async update(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    const appointmentsCollection = await getCollection<Appointment>(COLLECTIONS.APPOINTMENTS)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    
    await appointmentsCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getById(id)
  }
  
  // Update status
  static async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    const updateData: Partial<Appointment> = { status }
    
    const now = new Date()
    if (status === 'contacted') updateData.contacted_at = now
    if (status === 'scheduled') updateData.scheduled_at = now
    if (status === 'completed') updateData.completed_at = now
    
    return this.update(id, updateData)
  }
  
  // Assign appointment
  static async assign(id: string, assignedTo: string, assignedToEmail: string): Promise<Appointment | null> {
    return this.update(id, { assigned_to: assignedTo, assigned_to_email: assignedToEmail })
  }
  
  // Set follow-up
  static async setFollowUp(id: string, followUpAt: Date): Promise<Appointment | null> {
    return this.update(id, { follow_up_at: followUpAt })
  }
  
  // Add note
  static async addNote(
    id: string,
    content: string,
    createdBy: string,
    createdByEmail: string
  ): Promise<Appointment | null> {
    const appointmentsCollection = await getCollection<Appointment>(COLLECTIONS.APPOINTMENTS)
    
    const note: AppointmentNote = {
      id: uuidv4(),
      content,
      created_by: createdBy,
      created_by_email: createdByEmail,
      created_at: new Date()
    }
    
    await appointmentsCollection.updateOne(
      { id },
      {
        $push: { notes: note },
        $set: { updated_at: new Date() }
      }
    )
    
    return this.getById(id)
  }
  
  // Get stats
  static async getStats(): Promise<{
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
  }> {
    const appointmentsCollection = await getCollection<Appointment>(COLLECTIONS.APPOINTMENTS)
    
    const total = await appointmentsCollection.countDocuments({})
    
    const statusCounts = await Promise.all([
      appointmentsCollection.countDocuments({ status: 'new' }),
      appointmentsCollection.countDocuments({ status: 'contacted' }),
      appointmentsCollection.countDocuments({ status: 'scheduled' }),
      appointmentsCollection.countDocuments({ status: 'completed' }),
      appointmentsCollection.countDocuments({ status: 'cancelled' }),
      appointmentsCollection.countDocuments({ status: 'no_show' })
    ])
    
    const heatCounts = await Promise.all([
      appointmentsCollection.countDocuments({ lead_heat: 'hot' }),
      appointmentsCollection.countDocuments({ lead_heat: 'warm' }),
      appointmentsCollection.countDocuments({ lead_heat: 'cold' })
    ])
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayFollowUps = await appointmentsCollection.countDocuments({
      follow_up_at: { $gte: today, $lt: tomorrow }
    })
    
    return {
      total,
      new: statusCounts[0],
      contacted: statusCounts[1],
      scheduled: statusCounts[2],
      completed: statusCounts[3],
      cancelled: statusCounts[4],
      no_show: statusCounts[5],
      hot_leads: heatCounts[0],
      warm_leads: heatCounts[1],
      cold_leads: heatCounts[2],
      today_follow_ups: todayFollowUps
    }
  }
  
  // Check feedback received by phone
  static async checkFeedbackReceivedByPhone(phone: string): Promise<void> {
    const appointmentsCollection = await getCollection<Appointment>(COLLECTIONS.APPOINTMENTS)
    
    await appointmentsCollection.updateMany(
      { phone, feedback_sent: true, feedback_received: false },
      { $set: { feedback_received: true } }
    )
  }
}
