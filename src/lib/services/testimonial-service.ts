import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { Testimonial, TestimonialStatus, FeedbackType } from '@/lib/models/types'

export class TestimonialService {
  // Get all testimonials (admin)
  static async list(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      status?: TestimonialStatus
      rating?: number
      service_id?: string
      feedback_type?: FeedbackType
      consent_public?: boolean
      search?: string
      include_archived?: boolean
      sort_by?: string
      sort_order?: string
    }
  ): Promise<{ testimonials: Testimonial[]; total: number }> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    
    const filter: Record<string, unknown> = {}
    
    if (!filters?.include_archived) {
      filter.archived_at = null
    }
    
    if (filters?.status) {
      filter.status = filters.status
    }
    if (filters?.rating) {
      filter.rating = filters.rating
    }
    if (filters?.service_id) {
      filter.service_id = filters.service_id
    }
    if (filters?.feedback_type) {
      filter.feedback_type = filters.feedback_type
    }
    if (filters?.consent_public !== undefined) {
      filter.consent_public = filters.consent_public
    }
    if (filters?.search) {
      filter.$or = [
        { full_name: { $regex: filters.search, $options: 'i' } },
        { pet_name: { $regex: filters.search, $options: 'i' } },
        { comment: { $regex: filters.search, $options: 'i' } }
      ]
    }
    
    const sortField = filters?.sort_by || 'submitted_at'
    const sortOrder = filters?.sort_order === 'asc' ? 1 : -1
    
    const total = await testimonialsCollection.countDocuments(filter)
    const testimonials = await testimonialsCollection
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()
    
    return { testimonials, total }
  }
  
  // Get public testimonials
  static async getPublicTestimonials(limit: number = 10): Promise<Array<{
    id: string
    full_name: string
    pet_name: string
    pet_type: string | null
    pet_photo_url: string | null
    owner_photo_url: string | null
    service_name: string | null
    treatment: string | null
    rating: number
    comment: string
    submitted_at: string
  }>> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    
    const testimonials = await testimonialsCollection
      .find({
        status: 'approved',
        consent_public: true,
        archived_at: null
      })
      .sort({ sort_order: 1, submitted_at: -1 })
      .limit(limit)
      .toArray()
    
    return testimonials.map(t => ({
      id: t.id,
      full_name: t.full_name,
      pet_name: t.pet_name,
      pet_type: t.pet_type,
      pet_photo_url: t.pet_photo_url,
      owner_photo_url: t.owner_photo_url,
      service_name: t.service_name_snapshot,
      treatment: t.treatment,
      rating: t.rating,
      comment: t.comment,
      submitted_at: t.submitted_at.toISOString()
    }))
  }
  
  // Get by ID
  static async getById(id: string): Promise<Testimonial | null> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    return testimonialsCollection.findOne({ id })
  }
  
  // Create testimonial (admin)
  static async create(data: {
    full_name: string
    pet_name: string
    rating: number
    comment: string
    email?: string
    phone?: string
    pet_type?: string
    pet_photo_url?: string
    owner_photo_url?: string
    treatment?: string
    service_id?: string
    service_name_snapshot?: string
    feedback_type?: FeedbackType
    consent_public?: boolean
    consent_internal?: boolean
    status?: TestimonialStatus
    admin_note?: string
    source?: string
  }): Promise<Testimonial> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    
    // Get max sort order
    const maxSort = await testimonialsCollection
      .find({})
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray()
    const sortOrder = maxSort.length > 0 ? maxSort[0].sort_order + 1 : 0
    
    const feedbackType = data.rating >= 4 ? 'positive' : data.rating === 3 ? 'neutral' : 'negative'
    
    const testimonial: Testimonial = {
      id: uuidv4(),
      full_name: data.full_name,
      email: data.email || null,
      phone: data.phone || null,
      pet_name: data.pet_name,
      pet_type: data.pet_type || null,
      pet_photo_url: data.pet_photo_url || null,
      owner_photo_url: data.owner_photo_url || null,
      service_id: data.service_id || null,
      service_name_snapshot: data.service_name_snapshot || null,
      treatment: data.treatment || null,
      rating: data.rating,
      feedback_type: data.feedback_type || feedbackType,
      comment: data.comment,
      consent_internal: data.consent_internal ?? true,
      consent_public: data.consent_public ?? false,
      status: data.status || 'pending',
      admin_note: data.admin_note || null,
      submitted_at: new Date(),
      approved_at: null,
      approved_by: null,
      approved_by_email: null,
      source: data.source || 'admin',
      archived_at: null,
      sort_order: sortOrder
    }
    
    await testimonialsCollection.insertOne(testimonial)
    return testimonial
  }
  
  // Submit public feedback
  static async submitPublicFeedback(data: {
    full_name: string
    email?: string
    phone?: string
    pet_name: string
    pet_photo_url?: string
    service_id?: string
    rating: number
    feedback_type?: FeedbackType
    comment: string
    consent_internal: boolean
    consent_public: boolean
  }): Promise<Testimonial> {
    return this.create({
      ...data,
      source: 'website'
    })
  }
  
  // Update testimonial
  static async update(id: string, data: Partial<Testimonial>): Promise<Testimonial | null> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    
    const updateData: Record<string, unknown> = { ...data }
    delete updateData.id
    delete updateData.submitted_at
    
    await testimonialsCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getById(id)
  }
  
  // Update status
  static async updateStatus(
    id: string,
    status: TestimonialStatus,
    approvedBy?: string,
    approvedByEmail?: string
  ): Promise<Testimonial | null> {
    const updateData: Partial<Testimonial> = { status }
    
    if (status === 'approved') {
      updateData.approved_at = new Date()
      updateData.approved_by = approvedBy || null
      updateData.approved_by_email = approvedByEmail || null
    }
    
    return this.update(id, updateData)
  }
  
  // Bulk action
  static async bulkAction(
    ids: string[],
    action: 'approve' | 'reject' | 'archive',
    actorId?: string,
    actorEmail?: string
  ): Promise<number> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    
    let updateData: Record<string, unknown> = {}
    
    if (action === 'approve') {
      updateData = {
        status: 'approved',
        approved_at: new Date(),
        approved_by: actorId,
        approved_by_email: actorEmail
      }
    } else if (action === 'reject') {
      updateData = { status: 'rejected' }
    } else if (action === 'archive') {
      updateData = {
        status: 'archived',
        archived_at: new Date()
      }
    }
    
    const result = await testimonialsCollection.updateMany(
      { id: { $in: ids } },
      { $set: updateData }
    )
    
    return result.modifiedCount
  }
  
  // Archive
  static async archive(id: string): Promise<boolean> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    
    const result = await testimonialsCollection.updateOne(
      { id },
      { $set: { archived_at: new Date(), status: 'archived' as TestimonialStatus } }
    )
    
    return result.modifiedCount > 0
  }
  
  // Restore
  static async restore(id: string): Promise<Testimonial | null> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    
    await testimonialsCollection.updateOne(
      { id },
      { $set: { archived_at: null, status: 'pending' as TestimonialStatus } }
    )
    
    return this.getById(id)
  }
  
  // Delete
  static async delete(id: string): Promise<boolean> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    const result = await testimonialsCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
  
  // Get analytics
  static async getAnalytics(): Promise<{
    overall_avg_rating: number
    last_30_days_avg_rating: number
    total_count: number
    rating_distribution: Array<{ rating: number; count: number; percentage: number }>
    positive_count: number
    neutral_count: number
    negative_count: number
    positive_ratio: number
    pending_count: number
  }> {
    const testimonialsCollection = await getCollection<Testimonial>(COLLECTIONS.TESTIMONIALS)
    
    const all = await testimonialsCollection.find({ archived_at: null }).toArray()
    const totalCount = all.length
    
    if (totalCount === 0) {
      return {
        overall_avg_rating: 0,
        last_30_days_avg_rating: 0,
        total_count: 0,
        rating_distribution: [],
        positive_count: 0,
        neutral_count: 0,
        negative_count: 0,
        positive_ratio: 0,
        pending_count: 0
      }
    }
    
    const overallAvg = all.reduce((sum, t) => sum + t.rating, 0) / totalCount
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recent = all.filter(t => t.submitted_at >= thirtyDaysAgo)
    const recentAvg = recent.length > 0
      ? recent.reduce((sum, t) => sum + t.rating, 0) / recent.length
      : 0
    
    const ratingDist = [1, 2, 3, 4, 5].map(r => {
      const count = all.filter(t => t.rating === r).length
      return {
        rating: r,
        count,
        percentage: Math.round((count / totalCount) * 100)
      }
    })
    
    const positiveCount = all.filter(t => t.rating >= 4).length
    const neutralCount = all.filter(t => t.rating === 3).length
    const negativeCount = all.filter(t => t.rating < 3).length
    const pendingCount = all.filter(t => t.status === 'pending').length
    
    return {
      overall_avg_rating: Math.round(overallAvg * 10) / 10,
      last_30_days_avg_rating: Math.round(recentAvg * 10) / 10,
      total_count: totalCount,
      rating_distribution: ratingDist,
      positive_count: positiveCount,
      neutral_count: neutralCount,
      negative_count: negativeCount,
      positive_ratio: Math.round((positiveCount / totalCount) * 100),
      pending_count: pendingCount
    }
  }
}
