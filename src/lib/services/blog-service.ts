import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { BlogPost, BlogCategory, ServiceStatus, BlogSEO, AIMetadata } from '@/lib/models/types'

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

export class BlogService {
  // Get all blog posts (admin)
  static async list(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: ServiceStatus; archived?: boolean; search?: string; category?: string }
  ): Promise<{ posts: BlogPost[]; total: number }> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    
    const filter: Record<string, unknown> = {}
    
    if (filters?.archived) {
      filter.archived_at = { $ne: null }
    } else {
      filter.archived_at = null
    }
    
    if (filters?.status) {
      filter.status = filters.status
    }
    
    if (filters?.category) {
      filter.category = filters.category
    }
    
    if (filters?.search) {
      filter.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { excerpt: { $regex: filters.search, $options: 'i' } }
      ]
    }
    
    const total = await postsCollection.countDocuments(filter)
    const posts = await postsCollection
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    
    return { posts, total }
  }
  
  // Get published blog posts (public)
  static async getPublished(): Promise<{ posts: BlogPost[]; total: number }> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    
    const filter = {
      status: 'published',
      archived_at: null
    }
    
    const total = await postsCollection.countDocuments(filter)
    const posts = await postsCollection
      .find(filter)
      .sort({ published_at: -1 })
      .toArray()
    
    return { posts, total }
  }
  
  // Get by ID
  static async getById(id: string): Promise<BlogPost | null> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    return postsCollection.findOne({ id })
  }
  
  // Get by slug (public)
  static async getPublishedBySlug(slug: string): Promise<BlogPost | null> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    return postsCollection.findOne({
      slug,
      status: 'published',
      archived_at: null
    })
  }
  
  // Create blog post
  static async create(data: {
    title: string
    excerpt?: string
    cover_image_url?: string
    cover_image_alt?: string
    content?: string
    category?: string
    tags?: string[]
    seo?: BlogSEO
    status?: ServiceStatus
    ai_generated?: boolean
    ai_metadata?: AIMetadata
    created_by?: string
  }): Promise<BlogPost> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    
    // Generate unique slug
    let slug = generateSlug(data.title)
    let counter = 1
    while (await postsCollection.findOne({ slug })) {
      slug = `${generateSlug(data.title)}-${counter}`
      counter++
    }
    
    const now = new Date()
    const post: BlogPost = {
      id: uuidv4(),
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      cover_image_url: data.cover_image_url || null,
      cover_image_alt: data.cover_image_alt || null,
      content: data.content || null,
      category: data.category || null,
      tags: data.tags || [],
      seo: data.seo || null,
      status: data.status || 'draft',
      published_at: data.status === 'published' ? now : null,
      ai_generated: data.ai_generated || false,
      ai_metadata: data.ai_metadata || null,
      view_count: 0,
      archived_at: null,
      created_at: now,
      updated_at: now,
      created_by: data.created_by || null,
      updated_by: null
    }
    
    await postsCollection.insertOne(post)
    return post
  }
  
  // Update blog post
  static async update(id: string, data: Partial<BlogPost>, updatedBy?: string): Promise<BlogPost | null> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    
    const current = await this.getById(id)
    if (!current) return null
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date(),
      updated_by: updatedBy || null
    }
    
    // Set published_at if publishing
    if (data.status === 'published' && current.status !== 'published') {
      updateData.published_at = new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    delete updateData.created_by
    
    await postsCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getById(id)
  }
  
  // Update status
  static async updateStatus(id: string, status: ServiceStatus): Promise<BlogPost | null> {
    return this.update(id, { status })
  }
  
  // Increment view count
  static async incrementViewCount(slug: string, clientIp: string): Promise<number> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    
    // Simple increment (in production, implement deduplication with Redis)
    const result = await postsCollection.findOneAndUpdate(
      { slug },
      { $inc: { view_count: 1 } },
      { returnDocument: 'after' }
    )
    
    return result?.view_count || 0
  }
  
  // Archive
  static async archive(id: string): Promise<boolean> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    
    const result = await postsCollection.updateOne(
      { id },
      { $set: { archived_at: new Date(), status: 'archived' as ServiceStatus } }
    )
    
    return result.modifiedCount > 0
  }
  
  // Restore
  static async restore(id: string): Promise<BlogPost | null> {
    const postsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS)
    
    await postsCollection.updateOne(
      { id },
      { $set: { archived_at: null, status: 'draft' as ServiceStatus } }
    )
    
    return this.getById(id)
  }
}

// Blog Categories Service
export class BlogCategoryService {
  static async list(): Promise<BlogCategory[]> {
    const categoriesCollection = await getCollection<BlogCategory>(COLLECTIONS.BLOG_CATEGORIES)
    return categoriesCollection.find({}).sort({ sort_order: 1 }).toArray()
  }
  
  static async getById(id: string): Promise<BlogCategory | null> {
    const categoriesCollection = await getCollection<BlogCategory>(COLLECTIONS.BLOG_CATEGORIES)
    return categoriesCollection.findOne({ id })
  }
  
  static async create(data: {
    name: string
    description?: string
    color?: string
    icon?: string
  }): Promise<BlogCategory> {
    const categoriesCollection = await getCollection<BlogCategory>(COLLECTIONS.BLOG_CATEGORIES)
    
    const slug = generateSlug(data.name)
    
    const maxSort = await categoriesCollection
      .find({})
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray()
    const sortOrder = maxSort.length > 0 ? maxSort[0].sort_order + 1 : 0
    
    const now = new Date()
    const category: BlogCategory = {
      id: uuidv4(),
      name: data.name,
      slug,
      description: data.description || null,
      color: data.color || null,
      icon: data.icon || null,
      sort_order: sortOrder,
      is_active: true,
      post_count: 0,
      created_at: now,
      updated_at: now
    }
    
    await categoriesCollection.insertOne(category)
    return category
  }
  
  static async update(id: string, data: Partial<BlogCategory>): Promise<BlogCategory | null> {
    const categoriesCollection = await getCollection<BlogCategory>(COLLECTIONS.BLOG_CATEGORIES)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    
    await categoriesCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getById(id)
  }
  
  static async delete(id: string): Promise<boolean> {
    const categoriesCollection = await getCollection<BlogCategory>(COLLECTIONS.BLOG_CATEGORIES)
    const result = await categoriesCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
}
