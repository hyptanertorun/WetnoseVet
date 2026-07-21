import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAuth, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { AuthService } from '@/lib/services/auth-service'
import { AuditService } from '@/lib/services/audit-service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)
    
    // Revoke refresh token from cookie
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value
    
    if (refreshToken) {
      await AuthService.revokeRefreshToken(refreshToken)
    }
    
    // Log logout
    await AuditService.log({
      entityType: 'auth',
      action: 'logout',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress,
      userAgent
    })
    
    // Clear cookie
    cookieStore.delete('refresh_token')
    
    return NextResponse.json({ message: 'Çıkış başarılı' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { detail: 'Çıkış işlemi sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
