import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { GalleryAlbum, GalleryItem, ServiceStatus } from '@/lib/models/types'

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

export class GalleryService {
  // Get all albums (admin)
  static async listAlbums(): Promise<{ albums: GalleryAlbum[]; total: number }> {
    const albumsCollection = await getCollection<GalleryAlbum>(COLLECTIONS.GALLERY_ALBUMS)
    
    const albums = await albumsCollection.find({}).sort({ sort_order: 1 }).toArray()
    return { albums, total: albums.length }
  }
  
  // Get album by ID
  static async getAlbumById(id: string): Promise<GalleryAlbum | null> {
    const albumsCollection = await getCollection<GalleryAlbum>(COLLECTIONS.GALLERY_ALBUMS)
    return albumsCollection.findOne({ id })
  }
  
  // Create album
  static async createAlbum(data: {
    title: string
    description?: string
    cover_image_url?: string
    status?: ServiceStatus
  }): Promise<GalleryAlbum> {
    const albumsCollection = await getCollection<GalleryAlbum>(COLLECTIONS.GALLERY_ALBUMS)
    
    let slug = generateSlug(data.title)
    let counter = 1
    while (await albumsCollection.findOne({ slug })) {
      slug = `${generateSlug(data.title)}-${counter}`
      counter++
    }
    
    const maxSort = await albumsCollection
      .find({})
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray()
    const sortOrder = maxSort.length > 0 ? maxSort[0].sort_order + 1 : 0
    
    const now = new Date()
    const album: GalleryAlbum = {
      id: uuidv4(),
      title: data.title,
      slug,
      description: data.description || null,
      cover_image_url: data.cover_image_url || null,
      status: data.status || 'published',
      sort_order: sortOrder,
      created_at: now,
      updated_at: now
    }
    
    await albumsCollection.insertOne(album)
    return album
  }
  
  // Update album
  static async updateAlbum(id: string, data: Partial<GalleryAlbum>): Promise<GalleryAlbum | null> {
    const albumsCollection = await getCollection<GalleryAlbum>(COLLECTIONS.GALLERY_ALBUMS)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    
    await albumsCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getAlbumById(id)
  }
  
  // Delete album
  static async deleteAlbum(id: string): Promise<boolean> {
    const albumsCollection = await getCollection<GalleryAlbum>(COLLECTIONS.GALLERY_ALBUMS)
    const itemsCollection = await getCollection<GalleryItem>(COLLECTIONS.GALLERY_ITEMS)
    
    // Delete all items in album
    await itemsCollection.deleteMany({ album_id: id })
    
    const result = await albumsCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
  
  // Get items in album
  static async getItemsByAlbum(albumId: string): Promise<GalleryItem[]> {
    const itemsCollection = await getCollection<GalleryItem>(COLLECTIONS.GALLERY_ITEMS)
    return itemsCollection.find({ album_id: albumId }).sort({ sort_order: 1 }).toArray()
  }
  
  // Create item
  static async createItem(data: {
    album_id: string
    image_url: string
    image_alt?: string
    caption?: string
  }): Promise<GalleryItem> {
    const itemsCollection = await getCollection<GalleryItem>(COLLECTIONS.GALLERY_ITEMS)
    
    const maxSort = await itemsCollection
      .find({ album_id: data.album_id })
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray()
    const sortOrder = maxSort.length > 0 ? maxSort[0].sort_order + 1 : 0
    
    const item: GalleryItem = {
      id: uuidv4(),
      album_id: data.album_id,
      image_url: data.image_url,
      image_alt: data.image_alt || null,
      caption: data.caption || null,
      sort_order: sortOrder,
      created_at: new Date()
    }
    
    await itemsCollection.insertOne(item)
    return item
  }
  
  // Update item
  static async updateItem(id: string, data: Partial<GalleryItem>): Promise<GalleryItem | null> {
    const itemsCollection = await getCollection<GalleryItem>(COLLECTIONS.GALLERY_ITEMS)
    
    const updateData: Record<string, unknown> = { ...data }
    delete updateData.id
    delete updateData.album_id
    delete updateData.created_at
    
    await itemsCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return itemsCollection.findOne({ id })
  }
  
  // Delete item
  static async deleteItem(id: string): Promise<boolean> {
    const itemsCollection = await getCollection<GalleryItem>(COLLECTIONS.GALLERY_ITEMS)
    const result = await itemsCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
  
  // Reorder items
  static async reorderItems(items: Array<{ id: string; sort_order: number }>): Promise<void> {
    const itemsCollection = await getCollection<GalleryItem>(COLLECTIONS.GALLERY_ITEMS)
    
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: { sort_order: item.sort_order } }
      }
    }))
    
    await itemsCollection.bulkWrite(bulkOps)
  }
  
  // Get active albums with items (public)
  static async getActiveAlbumsWithItems(): Promise<Array<{
    id: string
    title: string
    slug: string
    description: string | null
    cover_image_url: string | null
    items: Array<{
      id: string
      image_url: string
      image_alt: string | null
      caption: string | null
    }>
  }>> {
    const albumsCollection = await getCollection<GalleryAlbum>(COLLECTIONS.GALLERY_ALBUMS)
    const itemsCollection = await getCollection<GalleryItem>(COLLECTIONS.GALLERY_ITEMS)
    
    const albums = await albumsCollection
      .find({ status: 'published' })
      .sort({ sort_order: 1 })
      .toArray()
    
    const result = []
    for (const album of albums) {
      const items = await itemsCollection
        .find({ album_id: album.id })
        .sort({ sort_order: 1 })
        .toArray()
      
      result.push({
        id: album.id,
        title: album.title,
        slug: album.slug,
        description: album.description,
        cover_image_url: album.cover_image_url,
        items: items.map(item => ({
          id: item.id,
          image_url: item.image_url,
          image_alt: item.image_alt,
          caption: item.caption
        }))
      })
    }
    
    return result
  }
  
  // Get stats
  static async getStats(): Promise<{ total_albums: number; total_items: number }> {
    const albumsCollection = await getCollection<GalleryAlbum>(COLLECTIONS.GALLERY_ALBUMS)
    const itemsCollection = await getCollection<GalleryItem>(COLLECTIONS.GALLERY_ITEMS)
    
    const totalAlbums = await albumsCollection.countDocuments({})
    const totalItems = await itemsCollection.countDocuments({})
    
    return { total_albums: totalAlbums, total_items: totalItems }
  }
}
