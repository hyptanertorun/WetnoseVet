import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAuth, getClientIP } from '@/lib/middleware/auth'
import { AuthService } from '@/lib/services/auth-service'
import { UserService } from '@/lib/services/user-service'
import { AuditService } from '@/lib/services/audit-service'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    const body = await request.json()
    const { current_password, new_password } = body
    
    if (!current_password || !new_password) {
      return NextResponse.json(
        { detail: 'Mevcut şifre ve yeni şifre gerekli' },
        { status: 400 }
      )
    }
    
    // Validate password strength
    if (new_password.length < 10) {
      return NextResponse.json(
        { detail: 'Şifre en az 10 karakter olmalı' },
        { status: 400 }
      )
    }
    
    const hasUpper = /[A-Z]/.test(new_password)
    const hasLower = /[a-z]/.test(new_password)
    const hasNumber = /[0-9]/.test(new_password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(new_password)
    
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        { detail: 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermeli' },
        { status: 400 }
      )
    }
    
    // Verify current password
    const verified = await AuthService.authenticateUser(user.email, current_password)
    
    if (!verified) {
      return NextResponse.json(
        { detail: 'Mevcut şifre hatalı' },
        { status: 401 }
      )
    }
    
    // Update password
    const success = await UserService.updatePassword(user.id, new_password)
    
    if (!success) {
      return NextResponse.json(
        { detail: 'Şifre güncellenirken hata oluştu' },
        { status: 500 }
      )
    }
    
    // Clear must_change_password flag
    await UserService.updateUser(user.id, { must_change_password: false })
    
    // Log password change
    const ipAddress = getClientIP(request)
    await AuditService.log({
      entityType: 'auth',
      action: 'password_change',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress,
      metadata: { forced: user.must_change_password }
    })
    
    return NextResponse.json({ message: 'Şifre başarıyla değiştirildi' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { detail: 'Şifre değiştirme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
