import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { ContactMessage, ContactStatus } from '@/lib/models/types'

export class ContactService {
  // Create contact message (public)
  static async create(data: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  }): Promise<ContactMessage> {
    const messagesCollection = await getCollection<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES)
    
    const contactMessage: ContactMessage = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      status: 'new',
      created_at: new Date(),
      read_at: null,
      replied_at: null
    }
    
    await messagesCollection.insertOne(contactMessage)
    return contactMessage
  }
  
  // List messages (admin)
  static async list(
    page: number = 1,
    limit: number = 20,
    filters?: { status?: ContactStatus; search?: string }
  ): Promise<{ messages: ContactMessage[]; total: number }> {
    const messagesCollection = await getCollection<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES)
    
    const filter: Record<string, unknown> = {}
    
    if (filters?.status) {
      filter.status = filters.status
    }
    
    if (filters?.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { subject: { $regex: filters.search, $options: 'i' } }
      ]
    }
    
    const total = await messagesCollection.countDocuments(filter)
    const messages = await messagesCollection
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    
    return { messages, total }
  }
  
  // Get by ID
  static async getById(id: string): Promise<ContactMessage | null> {
    const messagesCollection = await getCollection<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES)
    return messagesCollection.findOne({ id })
  }
  
  // Update status
  static async updateStatus(id: string, status: ContactStatus): Promise<ContactMessage | null> {
    const messagesCollection = await getCollection<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES)
    
    const updateData: Record<string, unknown> = { status }
    
    if (status === 'read') {
      updateData.read_at = new Date()
    } else if (status === 'replied') {
      updateData.replied_at = new Date()
    }
    
    await messagesCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getById(id)
  }
  
  // Delete message
  static async delete(id: string): Promise<boolean> {
    const messagesCollection = await getCollection<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES)
    const result = await messagesCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
  
  // Get stats
  static async getStats(): Promise<{
    total: number
    new: number
    read: number
    replied: number
    archived: number
  }> {
    const messagesCollection = await getCollection<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES)
    
    const [total, newCount, readCount, repliedCount, archivedCount] = await Promise.all([
      messagesCollection.countDocuments({}),
      messagesCollection.countDocuments({ status: 'new' }),
      messagesCollection.countDocuments({ status: 'read' }),
      messagesCollection.countDocuments({ status: 'replied' }),
      messagesCollection.countDocuments({ status: 'archived' })
    ])
    
    return {
      total,
      new: newCount,
      read: readCount,
      replied: repliedCount,
      archived: archivedCount
    }
  }
}
