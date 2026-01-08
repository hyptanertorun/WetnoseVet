import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import { AuthService } from './auth-service'
import type { User, UserRole, UserStatus } from '@/lib/models/types'

export class UserService {
  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    return usersCollection.findOne({ id: userId })
  }
  
  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    return usersCollection.findOne({ email: email.toLowerCase() })
  }
  
  // Create user
  static async createUser(
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'editor',
    phone?: string,
    createdBy?: string
  ): Promise<User | null> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    
    // Check if email exists
    const existing = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existing) {
      return null
    }
    
    const passwordHash = await AuthService.hashPassword(password)
    const now = new Date()
    
    const newUser: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      role,
      status: 'active',
      phone: phone || null,
      avatar_url: null,
      last_login: null,
      created_at: now,
      updated_at: now,
      created_by: createdBy || null,
      must_change_password: false
    }
    
    await usersCollection.insertOne(newUser)
    return newUser
  }
  
  // Update user
  static async updateUser(
    userId: string,
    updates: Partial<{
      email: string
      full_name: string
      role: UserRole
      status: UserStatus
      phone: string
      avatar_url: string
      must_change_password: boolean
    }>
  ): Promise<User | null> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    
    const updateData: Record<string, unknown> = {
      ...updates,
      updated_at: new Date()
    }
    
    if (updates.email) {
      updateData.email = updates.email.toLowerCase()
    }
    
    await usersCollection.updateOne(
      { id: userId },
      { $set: updateData }
    )
    
    return this.getUserById(userId)
  }
  
  // Update password
  static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    const passwordHash = await AuthService.hashPassword(newPassword)
    
    const result = await usersCollection.updateOne(
      { id: userId },
      {
        $set: {
          password_hash: passwordHash,
          updated_at: new Date()
        }
      }
    )
    
    return result.modifiedCount > 0
  }
  
  // List users
  static async listUsers(
    page: number = 1,
    pageSize: number = 20,
    role?: UserRole,
    status?: UserStatus
  ): Promise<{ users: User[]; total: number }> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    
    const filter: Record<string, unknown> = {}
    if (role) filter.role = role
    if (status) filter.status = status
    
    const total = await usersCollection.countDocuments(filter)
    const users = await usersCollection
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()
    
    return { users, total }
  }
  
  // Deactivate user
  static async deactivateUser(userId: string): Promise<boolean> {
    const result = await this.updateUser(userId, { status: 'inactive' })
    if (result) {
      await AuthService.revokeAllUserTokens(userId)
      return true
    }
    return false
  }
  
  // Activate user
  static async activateUser(userId: string): Promise<boolean> {
    const result = await this.updateUser(userId, { status: 'active' })
    return result !== null
  }
  
  // Ensure production admin
  static async ensureProductionAdmin(): Promise<void> {
    const initialEmail = process.env.INITIAL_ADMIN_EMAIL
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD
    
    if (!initialEmail || !initialPassword) {
      console.log('No initial admin credentials configured')
      return
    }
    
    const existing = await this.getUserByEmail(initialEmail)
    if (!existing) {
      await this.createUser(initialEmail, initialPassword, 'Admin', 'admin')
      console.log(`Created initial admin: ${initialEmail}`)
    }
  }
  
  // Ensure stage admin
  static async ensureStageAdmin(): Promise<void> {
    const stageEmail = process.env.STAGE_ADMIN_EMAIL
    const stagePassword = process.env.STAGE_ADMIN_PASSWORD
    
    if (!stageEmail || !stagePassword) {
      console.log('No stage admin credentials configured')
      return
    }
    
    const existing = await this.getUserByEmail(stageEmail)
    if (!existing) {
      await this.createUser(stageEmail, stagePassword, 'Stage Admin', 'admin')
      console.log(`Created stage admin: ${stageEmail}`)
    } else if (process.env.STAGE_ADMIN_SYNC === 'true') {
      // Sync password
      await this.updatePassword(existing.id, stagePassword)
    }
  }
}
