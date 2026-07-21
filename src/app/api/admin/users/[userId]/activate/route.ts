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
    
    const targetUser = await UserService.getUserById(userId)
    if (!targetUser) {
      return NextResponse.json({ detail: 'Kullanıcı bulunamadı' }, { status: 404 })
    }
    
    await UserService.activateUser(userId)
    
    await AuditService.log({
      entityType: 'user',
      entityId: userId,
      action: 'status_change',
      actorUserId: currentUser.id,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      metadata: { action: 'activate', target_email: targetUser.email },
      ipAddress: getClientIP(request)
    })
    
    return NextResponse.json({ message: 'Kullanıcı aktifleştirildi' })
  } catch (error) {
    console.error('Activate user error:', error)
    return NextResponse.json({ detail: 'Kullanıcı aktifleştirilirken hata oluştu' }, { status: 500 })
  }
}
