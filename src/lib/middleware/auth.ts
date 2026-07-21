import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { User } from '@/lib/models/types'

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')
const JWT_ALGORITHM = 'HS256'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string
if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET environment variable is required')

export interface JWTPayload {
  sub: string // user_id
  email: string
  role: string
  exp: number
  iat: number
}

export interface AuthResult {
  user: User | null
  error?: string
}

// Verify JWT and return user
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header' }
    }
    
    const token = authHeader.substring(7)
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM as jwt.Algorithm]
    }) as JWTPayload
    
    // Get user from database
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS)
    const user = await usersCollection.findOne({ id: decoded.sub })
    
    if (!user) {
      return { user: null, error: 'User not found' }
    }
    
    if (user.status !== 'active') {
      return { user: null, error: 'User is not active' }
    }
    
    return { user }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { user: null, error: 'Token expired' }
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { user: null, error: 'Invalid token' }
    }
    console.error('Auth verification error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

// Create access token
export function createAccessToken(userId: string, email: string, role: string): string {
  const expiresIn = 15 * 60 // 15 minutes
  
  return jwt.sign(
    {
      sub: userId,
      email,
      role
    },
    JWT_SECRET,
    {
      algorithm: JWT_ALGORITHM as jwt.Algorithm,
      expiresIn
    }
  )
}

// Create refresh token
export function createRefreshToken(userId: string, days: number = 7): { token: string; expiresAt: Date } {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)
  
  const token = jwt.sign(
    {
      sub: userId,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    {
      algorithm: JWT_ALGORITHM as jwt.Algorithm,
      expiresIn: `${days}d`
    }
  )
  
  return { token, expiresAt }
}

// Require authentication helper
export async function requireAuth(request: NextRequest): Promise<{ user: User } | NextResponse> {
  const { user, error } = await verifyAuth(request)
  
  if (!user) {
    return NextResponse.json(
      { detail: error || 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return { user }
}

// Require specific roles
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user: User } | NextResponse> {
  const authResult = await requireAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  if (!allowedRoles.includes(authResult.user.role)) {
    return NextResponse.json(
      { detail: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return authResult
}

// Require admin
export async function requireAdmin(request: NextRequest) {
  return requireRole(request, ['admin'])
}

// Require admin or manager
export async function requireAdminOrManager(request: NextRequest) {
  return requireRole(request, ['admin', 'manager'])
}

// Require admin, manager, or editor
export async function requireAdminManagerEditor(request: NextRequest) {
  return requireRole(request, ['admin', 'manager', 'editor'])
}

// Require operations roles (appointment requests, messages, ops dashboard)
export async function requireOpsRoles(request: NextRequest) {
  return requireRole(request, ['admin', 'manager', 'reception'])
}

// Get client IP from request
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

// Get user agent
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}
