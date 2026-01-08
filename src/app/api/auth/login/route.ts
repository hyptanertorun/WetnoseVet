import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth-service'
import { AuditService } from '@/lib/services/audit-service'
import { checkLoginRateLimit, rateLimitResponse, getClientIP } from '@/lib/middleware/rate-limit'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, remember_me = false } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { detail: 'E-posta ve şifre gerekli' },
        { status: 400 }
      )
    }
    
    // Rate limiting
    const rateLimitResult = checkLoginRateLimit(request, email)
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.retryAfterSeconds!)
    }
    
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Authenticate user
    const user = await AuthService.authenticateUser(email, password)
    
    if (!user) {
      // Log failed login
      await AuditService.log({
        entityType: 'auth',
        action: 'login_failed',
        metadata: { email },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Invalid credentials'
      })
      
      return NextResponse.json(
        { detail: 'E-posta veya şifre hatalı' },
        { status: 401 }
      )
    }
    
    // Create tokens
    const tokens = AuthService.createTokens(user, remember_me)
    
    // Store refresh token
    await AuthService.storeRefreshToken(user.id, tokens.refreshToken, tokens.refreshExpiresAt)
    
    // Update last login
    await AuthService.updateLastLogin(user.id)
    
    // Log successful login
    await AuditService.log({
      entityType: 'auth',
      action: 'login',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress,
      userAgent,
      metadata: { remember_me }
    })
    
    // Create response
    const response = NextResponse.json({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        must_change_password: user.must_change_password
      }
    })
    
    // Set refresh token cookie
    const cookieStore = await cookies()
    const isProduction = process.env.APP_ENV === 'production'
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined
    
    cookieStore.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: tokens.refreshDays * 24 * 60 * 60,
      ...(cookieDomain && { domain: cookieDomain })
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { detail: 'Giriş işlemi sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
