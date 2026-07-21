import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdmin, getClientIP } from '@/lib/middleware/auth'
import { UserService } from '@/lib/services/user-service'
import { AuditService } from '@/lib/services/audit-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult
    const { user: currentUser } = authResult
    
    const { userId } = await params
    const body = await request.json()
    const { new_password } = body
    
    if (!new_password) {
      return NextResponse.json({ detail: 'Yeni şifre gerekli' }, { status: 400 })
    }
    
    const targetUser = await UserService.getUserById(userId)
    if (!targetUser) {
      return NextResponse.json({ detail: 'Kullanıcı bulunamadı' }, { status: 404 })
    }
    
    await UserService.updatePassword(userId, new_password)
    
    await AuditService.log({
      entityType: 'user',
      entityId: userId,
      action: 'update',
      actorUserId: currentUser.id,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      metadata: { action: 'password_reset', target_email: targetUser.email },
      ipAddress: getClientIP(request)
    })
    
    return NextResponse.json({ message: 'Şifre başarıyla sıfırlandı' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ detail: 'Şifre sıfırlanırken hata oluştu' }, { status: 500 })
  }
}
