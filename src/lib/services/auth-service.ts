import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import { createAccessToken, createRefreshToken } from '@/lib/middleware/auth'
import type { User, RefreshToken } from '@/lib/models/types'

const BCRYPT_ROUNDS = 12

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS)
  }
  
  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
  
  // Authenticate user
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    // Check for support admin (hidden admin not in database)
    const supportEmail = process.env.SUPPORT_ADMIN_EMAIL
    const supportPassword = process.env.SUPPORT_ADMIN_PASSWORD
    
    if (supportEmail && supportPassword && email === supportEmail && password === supportPassword) {
      return {
        id: 'support-admin',
        email: supportEmail,
        password_hash: '',
        full_name: 'Support Admin',
        role: 'admin',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        must_change_password: false,
        is_support_admin: true
      }
    }
    
    // Check for stage admin
    const appEnv = process.env.APP_ENV || 'preview'
    const stageAdminEmail = process.env.STAGE_ADMIN_EMAIL
    const stageAdminPassword = process.env.STAGE_ADMIN_PASSWORD
    
    if (appEnv !== 'production' && stageAdminEmail && stageAdminPassword) {
      if (email === stageAdminEmail && password === stageAdminPassword) {
        // Return or create stage admin
        const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
        let stageUser = await usersCollection.findOne({ email: stageAdminEmail })
        
        if (!stageUser) {
          const hashedPassword = await this.hashPassword(stageAdminPassword)
          stageUser = {
            id: uuidv4(),
            email: stageAdminEmail,
            password_hash: hashedPassword,
            full_name: 'Stage Admin',
            role: 'admin',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
            must_change_password: false
          }
          await usersCollection.insertOne(stageUser)
        }
        
        return stageUser
      }
    }
    
    // Regular database authentication
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    const user = await usersCollection.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return null
    }
    
    const isValid = await this.verifyPassword(password, user.password_hash)
    if (!isValid) {
      return null
    }
    
    return user
  }
  
  // Store refresh token
  static async storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const tokensCollection = await getCollection<RefreshToken>(COLLECTIONS.REFRESH_TOKENS)
    
    await tokensCollection.insertOne({
      id: uuidv4(),
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: new Date(),
      revoked: false
    })
  }
  
  // Validate refresh token
  static async validateRefreshToken(token: string): Promise<string | null> {
    const tokensCollection = await getCollection<RefreshToken>(COLLECTIONS.REFRESH_TOKENS)
    
    const tokenDoc = await tokensCollection.findOne({
      token,
      revoked: false,
      expires_at: { $gt: new Date() }
    })
    
    if (!tokenDoc) {
      return null
    }
    
    return tokenDoc.user_id
  }
  
  // Revoke refresh token
  static async revokeRefreshToken(token: string): Promise<void> {
    const tokensCollection = await getCollection<RefreshToken>(COLLECTIONS.REFRESH_TOKENS)
    
    await tokensCollection.updateOne(
      { token },
      { $set: { revoked: true } }
    )
  }
  
  // Revoke all user tokens
  static async revokeAllUserTokens(userId: string): Promise<void> {
    const tokensCollection = await getCollection<RefreshToken>(COLLECTIONS.REFRESH_TOKENS)
    
    await tokensCollection.updateMany(
      { user_id: userId },
      { $set: { revoked: true } }
    )
  }
  
  // Update last login
  static async updateLastLogin(userId: string): Promise<void> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    
    await usersCollection.updateOne(
      { id: userId },
      { $set: { last_login: new Date() } }
    )
  }
  
  // Create tokens for user
  static createTokens(user: User, rememberMe: boolean = false) {
    const accessToken = createAccessToken(user.id, user.email, user.role)
    const refreshDays = rememberMe ? 30 : 7
    const { token: refreshToken, expiresAt } = createRefreshToken(user.id, refreshDays)
    
    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt,
      refreshDays
    }
  }
}
