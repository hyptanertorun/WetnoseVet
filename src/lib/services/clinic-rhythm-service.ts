import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { 
  ClinicRhythm, 
  PoolQuestion, 
  PoolAlarm, 
  ServiceStatus,
  FeaturedQuestion,
  FalseAlarm
} from '@/lib/models/types'
import crypto from 'crypto'

export class ClinicRhythmService {
  // List all entries (admin)
  static async list(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: ServiceStatus }
  ): Promise<{ entries: ClinicRhythm[]; total: number }> {
    const rhythmCollection = await getCollection<ClinicRhythm>(COLLECTIONS.CLINIC_RHYTHM)
    
    const filter: Record<string, unknown> = {}
    if (filters?.status) {
      filter.status = filters.status
    }
    
    const total = await rhythmCollection.countDocuments(filter)
    const entries = await rhythmCollection
      .find(filter)
      .sort({ date_key: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    
    return { entries, total }
  }
  
  // Get by ID
  static async getById(id: string): Promise<ClinicRhythm | null> {
    const rhythmCollection = await getCollection<ClinicRhythm>(COLLECTIONS.CLINIC_RHYTHM)
    return rhythmCollection.findOne({ id })
  }
  
  // Get by date key
  static async getByDateKey(dateKey: string): Promise<ClinicRhythm | null> {
    const rhythmCollection = await getCollection<ClinicRhythm>(COLLECTIONS.CLINIC_RHYTHM)
    return rhythmCollection.findOne({ date_key: dateKey })
  }
  
  // Get today's published entry
  static async getTodayPublished(): Promise<ClinicRhythm | null> {
    const today = new Date().toISOString().split('T')[0]
    const rhythmCollection = await getCollection<ClinicRhythm>(COLLECTIONS.CLINIC_RHYTHM)
    return rhythmCollection.findOne({
      date_key: today,
      status: 'published'
    })
  }
  
  // Get latest published
  static async getLatestPublished(): Promise<ClinicRhythm | null> {
    const rhythmCollection = await getCollection<ClinicRhythm>(COLLECTIONS.CLINIC_RHYTHM)
    return rhythmCollection.findOne(
      { status: 'published' },
      { sort: { date_key: -1 } }
    )
  }
  
  // Create entry
  static async create(data: {
    date_key: string
    featured_question?: FeaturedQuestion
    false_alarm?: FalseAlarm
    status?: ServiceStatus
    created_by?: string
  }): Promise<ClinicRhythm> {
    const rhythmCollection = await getCollection<ClinicRhythm>(COLLECTIONS.CLINIC_RHYTHM)
    
    const now = new Date()
    const entry: ClinicRhythm = {
      id: uuidv4(),
      date_key: data.date_key,
      featured_question: data.featured_question || null,
      false_alarm: data.false_alarm || null,
      status: data.status || 'draft',
      created_at: now,
      updated_at: now,
      created_by: data.created_by || null
    }
    
    await rhythmCollection.insertOne(entry)
    return entry
  }
  
  // Update entry
  static async update(id: string, data: Partial<ClinicRhythm>): Promise<ClinicRhythm | null> {
    const rhythmCollection = await getCollection<ClinicRhythm>(COLLECTIONS.CLINIC_RHYTHM)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    delete updateData.created_by
    
    await rhythmCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getById(id)
  }
  
  // Update status
  static async updateStatus(id: string, status: ServiceStatus): Promise<ClinicRhythm | null> {
    return this.update(id, { status })
  }
  
  // Delete entry
  static async delete(id: string): Promise<boolean> {
    const rhythmCollection = await getCollection<ClinicRhythm>(COLLECTIONS.CLINIC_RHYTHM)
    const result = await rhythmCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
}

// Pool Service for questions and alarms
export class PoolService {
  // Get active questions
  static async getActiveQuestions(): Promise<PoolQuestion[]> {
    const questionsCollection = await getCollection<PoolQuestion>(COLLECTIONS.POOL_QUESTIONS)
    return questionsCollection.find({ is_active: true }).toArray()
  }
  
  // Get active alarms
  static async getActiveAlarms(): Promise<PoolAlarm[]> {
    const alarmsCollection = await getCollection<PoolAlarm>(COLLECTIONS.POOL_ALARMS)
    return alarmsCollection.find({ is_active: true }).toArray()
  }
  
  // List all questions (admin)
  static async listQuestions(): Promise<PoolQuestion[]> {
    const questionsCollection = await getCollection<PoolQuestion>(COLLECTIONS.POOL_QUESTIONS)
    return questionsCollection.find({}).sort({ created_at: -1 }).toArray()
  }
  
  // List all alarms (admin)
  static async listAlarms(): Promise<PoolAlarm[]> {
    const alarmsCollection = await getCollection<PoolAlarm>(COLLECTIONS.POOL_ALARMS)
    return alarmsCollection.find({}).sort({ created_at: -1 }).toArray()
  }
  
  // Get question by ID
  static async getQuestionById(id: string): Promise<PoolQuestion | null> {
    const questionsCollection = await getCollection<PoolQuestion>(COLLECTIONS.POOL_QUESTIONS)
    return questionsCollection.findOne({ id })
  }
  
  // Get alarm by ID
  static async getAlarmById(id: string): Promise<PoolAlarm | null> {
    const alarmsCollection = await getCollection<PoolAlarm>(COLLECTIONS.POOL_ALARMS)
    return alarmsCollection.findOne({ id })
  }
  
  // Create question
  static async createQuestion(data: {
    question_text: string
    short_answer: string
    related_blog_slug?: string
    related_blog_title?: string
    is_active?: boolean
  }): Promise<PoolQuestion> {
    const questionsCollection = await getCollection<PoolQuestion>(COLLECTIONS.POOL_QUESTIONS)
    
    const now = new Date()
    const question: PoolQuestion = {
      id: uuidv4(),
      question_text: data.question_text,
      short_answer: data.short_answer,
      related_blog_slug: data.related_blog_slug || null,
      related_blog_title: data.related_blog_title || null,
      is_active: data.is_active ?? true,
      created_at: now,
      updated_at: now
    }
    
    await questionsCollection.insertOne(question)
    return question
  }
  
  // Create alarm
  static async createAlarm(data: {
    message_title: string
    message_body: string
    supportive_line: string
    is_active?: boolean
  }): Promise<PoolAlarm> {
    const alarmsCollection = await getCollection<PoolAlarm>(COLLECTIONS.POOL_ALARMS)
    
    const now = new Date()
    const alarm: PoolAlarm = {
      id: uuidv4(),
      message_title: data.message_title,
      message_body: data.message_body,
      supportive_line: data.supportive_line,
      is_active: data.is_active ?? true,
      created_at: now,
      updated_at: now
    }
    
    await alarmsCollection.insertOne(alarm)
    return alarm
  }
  
  // Update question
  static async updateQuestion(id: string, data: Partial<PoolQuestion>): Promise<PoolQuestion | null> {
    const questionsCollection = await getCollection<PoolQuestion>(COLLECTIONS.POOL_QUESTIONS)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    
    await questionsCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getQuestionById(id)
  }
  
  // Update alarm
  static async updateAlarm(id: string, data: Partial<PoolAlarm>): Promise<PoolAlarm | null> {
    const alarmsCollection = await getCollection<PoolAlarm>(COLLECTIONS.POOL_ALARMS)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    
    await alarmsCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getAlarmById(id)
  }
  
  // Delete question
  static async deleteQuestion(id: string): Promise<boolean> {
    const questionsCollection = await getCollection<PoolQuestion>(COLLECTIONS.POOL_QUESTIONS)
    const result = await questionsCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
  
  // Delete alarm
  static async deleteAlarm(id: string): Promise<boolean> {
    const alarmsCollection = await getCollection<PoolAlarm>(COLLECTIONS.POOL_ALARMS)
    const result = await alarmsCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
  
  // Get stats
  static async getStats(): Promise<{
    total_questions: number
    active_questions: number
    total_alarms: number
    active_alarms: number
  }> {
    const questionsCollection = await getCollection<PoolQuestion>(COLLECTIONS.POOL_QUESTIONS)
    const alarmsCollection = await getCollection<PoolAlarm>(COLLECTIONS.POOL_ALARMS)
    
    const [totalQ, activeQ, totalA, activeA] = await Promise.all([
      questionsCollection.countDocuments({}),
      questionsCollection.countDocuments({ is_active: true }),
      alarmsCollection.countDocuments({}),
      alarmsCollection.countDocuments({ is_active: true })
    ])
    
    return {
      total_questions: totalQ,
      active_questions: activeQ,
      total_alarms: totalA,
      active_alarms: activeA
    }
  }
  
  // Get pool content for a specific date (deterministic)
  static async getPoolContentForDate(dateStr: string): Promise<{
    featured_question: FeaturedQuestion
    false_alarm: FalseAlarm
  }> {
    const questions = await this.getActiveQuestions()
    const alarms = await this.getActiveAlarms()
    
    // Default fallback
    const defaultQuestion: FeaturedQuestion = {
      question_text: 'Evcil hayvanınızı seviyorsanız onu düzenli veteriner kontrolüne götürün!',
      short_answer: 'Düzenli kontroller olası sağlık sorunlarını erken tespit etmemize yardımcı olur.',
      related_blog_slug: null,
      related_blog_title: null
    }
    
    const defaultAlarm: FalseAlarm = {
      message_title: 'Panik Yapmayın',
      message_body: 'Evcil hayvanınızdaki küçük değişiklikler her zaman ciddi bir sorun anlamına gelmez.',
      supportive_line: 'Şüphede kalırsanız veterinerinize danışın.'
    }
    
    if (questions.length === 0 || alarms.length === 0) {
      return {
        featured_question: defaultQuestion,
        false_alarm: defaultAlarm
      }
    }
    
    // Deterministic selection based on date hash
    const dateHash = parseInt(crypto.createHash('md5').update(dateStr).digest('hex'), 16)
    
    const questionIndex = dateHash % questions.length
    const alarmIndex = Math.floor(dateHash / questions.length) % alarms.length
    
    const selectedQuestion = questions[questionIndex]
    const selectedAlarm = alarms[alarmIndex]
    
    return {
      featured_question: {
        question_text: selectedQuestion.question_text,
        short_answer: selectedQuestion.short_answer,
        related_blog_slug: selectedQuestion.related_blog_slug,
        related_blog_title: selectedQuestion.related_blog_title
      },
      false_alarm: {
        message_title: selectedAlarm.message_title,
        message_body: selectedAlarm.message_body,
        supportive_line: selectedAlarm.supportive_line
      }
    }
  }
}
