import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { Version } from '@/lib/models/types'

export class VersionService {
  // Create version snapshot
  static async createVersion(
    entityType: string,
    entityId: string,
    snapshot: Record<string, unknown>,
    createdBy: string,
    createdByEmail: string,
    changeReason?: string
  ): Promise<Version> {
    const versionsCollection = await getCollection<Version>(COLLECTIONS.VERSIONS)
    
    // Get current max version number
    const maxVersion = await versionsCollection
      .find({ entity_type: entityType, entity_id: entityId })
      .sort({ version_no: -1 })
      .limit(1)
      .toArray()
    
    const versionNo = maxVersion.length > 0 ? maxVersion[0].version_no + 1 : 1
    
    const version: Version = {
      id: uuidv4(),
      entity_type: entityType,
      entity_id: entityId,
      version_no: versionNo,
      snapshot,
      change_reason: changeReason || null,
      created_at: new Date(),
      created_by: createdBy,
      created_by_email: createdByEmail
    }
    
    await versionsCollection.insertOne(version)
    return version
  }
  
  // Get versions for entity
  static async getVersions(
    entityType: string,
    entityId: string
  ): Promise<{ versions: Version[]; total: number }> {
    const versionsCollection = await getCollection<Version>(COLLECTIONS.VERSIONS)
    
    const versions = await versionsCollection
      .find({ entity_type: entityType, entity_id: entityId })
      .sort({ version_no: -1 })
      .toArray()
    
    return { versions, total: versions.length }
  }
  
  // Get specific version
  static async getVersion(id: string): Promise<Version | null> {
    const versionsCollection = await getCollection<Version>(COLLECTIONS.VERSIONS)
    return versionsCollection.findOne({ id })
  }
  
  // Delete all versions for entity
  static async deleteEntityVersions(entityType: string, entityId: string): Promise<void> {
    const versionsCollection = await getCollection<Version>(COLLECTIONS.VERSIONS)
    await versionsCollection.deleteMany({ entity_type: entityType, entity_id: entityId })
  }
}
