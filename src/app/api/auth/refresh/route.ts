import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth-service'
import { UserService } from '@/lib/services/user-service'
import { AuditService } from '@/lib/services/audit-service'
import { getClientIP } from '@/lib/middleware/rate-limit'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from body or cookie
    let refreshToken: string | undefined
    
    try {
      const body = await request.json()
      refreshToken = body.refresh_token
    } catch {
      // Body might be empty
    }
    
    if (!refreshToken) {
      const cookieStore = await cookies()
      refreshToken = cookieStore.get('refresh_token')?.value
    }
    
    if (!refreshToken) {
      return NextResponse.json(
        { detail: 'Refresh token gerekli' },
        { status: 401 }
      )
    }
    
    // Validate refresh token
    const userId = await AuthService.validateRefreshToken(refreshToken)
    
    if (!userId) {
      return NextResponse.json(
        { detail: 'Geçersiz veya süresi dolmuş refresh token' },
        { status: 401 }
      )
    }
    
    // Get user
    const user = await UserService.getUserById(userId)
    
    if (!user) {
      return NextResponse.json(
        { detail: 'Kullanıcı bulunamadı' },
        { status: 401 }
      )
    }
    
    // Revoke old refresh token
    await AuthService.revokeRefreshToken(refreshToken)
    
    // Create new tokens
    const tokens = AuthService.createTokens(user, false)
    
    // Store new refresh token
    await AuthService.storeRefreshToken(user.id, tokens.refreshToken, tokens.refreshExpiresAt)
    
    // Log token refresh
    const ipAddress = getClientIP(request)
    await AuditService.log({
      entityType: 'auth',
      action: 'token_refresh',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress
    })
    
    // Update cookie
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
    
    return NextResponse.json({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { detail: 'Token yenileme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
