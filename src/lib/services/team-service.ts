import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { TeamMember, ServiceStatus, SocialLinks } from '@/lib/models/types'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\sğüşıöç-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export class TeamService {
  // Get all team members (admin)
  static async list(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: ServiceStatus; archived?: boolean; search?: string }
  ): Promise<{ members: TeamMember[]; total: number }> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    
    const filter: Record<string, unknown> = {}
    
    if (filters?.archived) {
      filter.archived_at = { $ne: null }
    } else {
      filter.archived_at = null
    }
    
    if (filters?.status) {
      filter.status = filters.status
    }
    
    if (filters?.search) {
      filter.$or = [
        { full_name: { $regex: filters.search, $options: 'i' } },
        { role_title: { $regex: filters.search, $options: 'i' } }
      ]
    }
    
    const total = await membersCollection.countDocuments(filter)
    const members = await membersCollection
      .find(filter)
      .sort({ sort_order: 1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    
    return { members, total }
  }
  
  // Get published team members (public)
  static async getPublished(): Promise<TeamMember[]> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    
    return membersCollection
      .find({
        status: 'published',
        archived_at: null
      })
      .sort({ sort_order: 1 })
      .toArray()
  }
  
  // Get by ID
  static async getById(id: string): Promise<TeamMember | null> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    return membersCollection.findOne({ id })
  }
  
  // Get by slug (public)
  static async getPublishedBySlug(slug: string): Promise<TeamMember | null> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    return membersCollection.findOne({
      slug,
      status: 'published',
      archived_at: null
    })
  }
  
  // Create team member
  static async create(data: {
    full_name: string
    role_title: string
    department?: string
    specialties?: string[]
    bio?: string
    short_bio?: string
    photo_url: string
    photo_alt?: string
    email?: string
    phone?: string
    social_links?: SocialLinks
    experience?: string
    experience_years?: number
    quote?: string
    education?: string[]
    certifications?: string[]
    working_schedule?: string
    accepts_appointments?: boolean
    is_owner?: boolean
    is_featured?: boolean
    show_contact_info?: boolean
    status?: ServiceStatus
  }): Promise<TeamMember> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    
    // Generate unique slug
    let slug = generateSlug(data.full_name)
    let counter = 1
    while (await membersCollection.findOne({ slug })) {
      slug = `${generateSlug(data.full_name)}-${counter}`
      counter++
    }
    
    // Get max sort order
    const maxSort = await membersCollection
      .find({})
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray()
    const sortOrder = maxSort.length > 0 ? maxSort[0].sort_order + 1 : 0
    
    const now = new Date()
    const member: TeamMember = {
      id: uuidv4(),
      full_name: data.full_name,
      slug,
      role_title: data.role_title,
      department: data.department || null,
      specialties: data.specialties || [],
      bio: data.bio || null,
      short_bio: data.short_bio || null,
      photo_url: data.photo_url,
      photo_alt: data.photo_alt || null,
      photo_thumbnail: null,
      email: data.email || null,
      phone: data.phone || null,
      social_links: data.social_links || {},
      experience: data.experience || null,
      experience_years: data.experience_years || null,
      quote: data.quote || null,
      education: data.education || [],
      certifications: data.certifications || [],
      working_schedule: data.working_schedule || null,
      accepts_appointments: data.accepts_appointments ?? true,
      is_owner: data.is_owner ?? false,
      is_featured: data.is_featured ?? false,
      show_contact_info: data.show_contact_info ?? true,
      status: data.status || 'draft',
      sort_order: sortOrder,
      archived_at: null,
      created_at: now,
      updated_at: now
    }
    
    await membersCollection.insertOne(member)
    return member
  }
  
  // Update team member
  static async update(id: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    
    await membersCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getById(id)
  }
  
  // Update status
  static async updateStatus(id: string, status: ServiceStatus): Promise<TeamMember | null> {
    return this.update(id, { status })
  }
  
  // Archive
  static async archive(id: string): Promise<boolean> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    
    const result = await membersCollection.updateOne(
      { id },
      { $set: { archived_at: new Date(), status: 'archived' as ServiceStatus } }
    )
    
    return result.modifiedCount > 0
  }
  
  // Restore
  static async restore(id: string): Promise<TeamMember | null> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    
    await membersCollection.updateOne(
      { id },
      { $set: { archived_at: null, status: 'draft' as ServiceStatus } }
    )
    
    return this.getById(id)
  }
  
  // Reorder
  static async reorder(items: Array<{ id: string; sort_order: number }>): Promise<void> {
    const membersCollection = await getCollection<TeamMember>(COLLECTIONS.TEAM_MEMBERS)
    
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: { sort_order: item.sort_order, updated_at: new Date() } }
      }
    }))
    
    await membersCollection.bulkWrite(bulkOps)
  }
}
