import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { AuditLog, AuditAction } from '@/lib/models/types'

export class AuditService {
  static async log(params: {
    entityType: string
    entityId?: string
    action: AuditAction
    actorUserId?: string
    actorEmail?: string
    actorRole?: string
    beforeState?: Record<string, unknown>
    afterState?: Record<string, unknown>
    metadata?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    success?: boolean
    errorMessage?: string
  }): Promise<void> {
    try {
      const logsCollection = await getCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS)
      
      const log: AuditLog = {
        id: uuidv4(),
        actor_user_id: params.actorUserId || null,
        actor_email: params.actorEmail || null,
        actor_role: params.actorRole || null,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        action: params.action,
        before_state: params.beforeState || null,
        after_state: params.afterState || null,
        metadata: params.metadata || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
        timestamp: new Date(),
        success: params.success !== false,
        error_message: params.errorMessage || null
      }
      
      await logsCollection.insertOne(log)
    } catch (error) {
      console.error('Failed to write audit log:', error)
    }
  }
  
  static async getLogs(
    page: number = 1,
    pageSize: number = 50,
    filters?: {
      entityType?: string
      action?: AuditAction
      actorUserId?: string
      startDate?: Date
      endDate?: Date
    }
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const logsCollection = await getCollection<AuditLog>(COLLECTIONS.AUDIT_LOGS)
    
    const filter: Record<string, unknown> = {}
    
    if (filters?.entityType) {
      filter.entity_type = filters.entityType
    }
    if (filters?.action) {
      filter.action = filters.action
    }
    if (filters?.actorUserId) {
      filter.actor_user_id = filters.actorUserId
    }
    if (filters?.startDate || filters?.endDate) {
      filter.timestamp = {}
      if (filters.startDate) {
        (filter.timestamp as Record<string, Date>).$gte = filters.startDate
      }
      if (filters.endDate) {
        (filter.timestamp as Record<string, Date>).$lte = filters.endDate
      }
    }
    
    const total = await logsCollection.countDocuments(filter)
    const logs = await logsCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()
    
    return { logs, total }
  }
}
