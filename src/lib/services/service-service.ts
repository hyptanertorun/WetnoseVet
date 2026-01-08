import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { Service, ServiceStatus, PriceMode, ServiceSEO } from '@/lib/models/types'

function generateSlug(title: string): string {
  return title
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

export class ServiceService {
  // Get all services (admin)
  static async list(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: ServiceStatus; archived?: boolean; search?: string }
  ): Promise<{ services: Service[]; total: number }> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    
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
        { title: { $regex: filters.search, $options: 'i' } },
        { short_description: { $regex: filters.search, $options: 'i' } }
      ]
    }
    
    const total = await servicesCollection.countDocuments(filter)
    const services = await servicesCollection
      .find(filter)
      .sort({ sort_order: 1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    
    return { services, total }
  }
  
  // Get published services (public)
  static async getPublished(): Promise<Service[]> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    
    return servicesCollection
      .find({
        status: 'published',
        archived_at: null
      })
      .sort({ sort_order: 1 })
      .toArray()
  }
  
  // Get by ID
  static async getById(id: string): Promise<Service | null> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    return servicesCollection.findOne({ id })
  }
  
  // Get by slug (public)
  static async getPublishedBySlug(slug: string): Promise<Service | null> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    return servicesCollection.findOne({
      slug,
      status: 'published',
      archived_at: null
    })
  }
  
  // Create service
  static async create(data: {
    title: string
    short_description: string
    long_description?: string
    cover_image_url: string
    cover_image_alt?: string
    icon?: string
    price_mode?: PriceMode
    price_value?: number
    tags?: string[]
    category?: string
    seo?: ServiceSEO
    status?: ServiceStatus
    created_by?: string
  }): Promise<Service> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    
    // Generate unique slug
    let slug = generateSlug(data.title)
    let counter = 1
    while (await servicesCollection.findOne({ slug })) {
      slug = `${generateSlug(data.title)}-${counter}`
      counter++
    }
    
    // Get max sort order
    const maxSort = await servicesCollection
      .find({})
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray()
    const sortOrder = maxSort.length > 0 ? maxSort[0].sort_order + 1 : 0
    
    const now = new Date()
    const service: Service = {
      id: uuidv4(),
      title: data.title,
      slug,
      short_description: data.short_description,
      long_description: data.long_description || null,
      cover_image_url: data.cover_image_url,
      cover_image_alt: data.cover_image_alt || null,
      icon: data.icon || null,
      price_mode: data.price_mode || 'contact',
      price_value: data.price_value || null,
      tags: data.tags || [],
      category: data.category || null,
      seo: data.seo || { meta_title: null, meta_description: null, og_image_url: null },
      status: data.status || 'draft',
      sort_order: sortOrder,
      archived_at: null,
      created_at: now,
      updated_at: now,
      created_by: data.created_by || null,
      updated_by: null
    }
    
    await servicesCollection.insertOne(service)
    return service
  }
  
  // Update service
  static async update(id: string, data: Partial<Service>, updatedBy?: string): Promise<Service | null> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date(),
      updated_by: updatedBy || null
    }
    
    // Don't allow updating certain fields
    delete updateData.id
    delete updateData.created_at
    delete updateData.created_by
    
    await servicesCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getById(id)
  }
  
  // Update status
  static async updateStatus(id: string, status: ServiceStatus): Promise<Service | null> {
    return this.update(id, { status })
  }
  
  // Delete (archive)
  static async archive(id: string): Promise<boolean> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    
    const result = await servicesCollection.updateOne(
      { id },
      { $set: { archived_at: new Date(), status: 'archived' } }
    )
    
    return result.modifiedCount > 0
  }
  
  // Restore
  static async restore(id: string): Promise<Service | null> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    
    await servicesCollection.updateOne(
      { id },
      { $set: { archived_at: null, status: 'draft' } }
    )
    
    return this.getById(id)
  }
  
  // Reorder
  static async reorder(items: Array<{ id: string; sort_order: number }>): Promise<void> {
    const servicesCollection = await getCollection<Service>(COLLECTIONS.SERVICES)
    
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: { sort_order: item.sort_order, updated_at: new Date() } }
      }
    }))
    
    await servicesCollection.bulkWrite(bulkOps)
  }
}
