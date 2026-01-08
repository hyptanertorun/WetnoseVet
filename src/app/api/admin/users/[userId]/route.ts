import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrManager, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { UserService } from '@/lib/services/user-service'
import { AuditService } from '@/lib/services/audit-service'
import { AuthService } from '@/lib/services/auth-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireAdminOrManager(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { userId } = await params
    const user = await UserService.getUserById(userId)
    
    if (!user) {
      return NextResponse.json({ detail: 'Kullanıcı bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      phone: user.phone,
      avatar_url: user.avatar_url,
      last_login: user.last_login?.toISOString() || null,
      created_at: user.created_at?.toISOString() || null,
      updated_at: user.updated_at?.toISOString() || null,
      must_change_password: user.must_change_password
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ detail: 'Kullanıcı alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireAdminOrManager(request)
    if (authResult instanceof NextResponse) return authResult
    const { user: currentUser } = authResult
    
    const { userId } = await params
    const body = await request.json()
    
    const beforeUser = await UserService.getUserById(userId)
    if (!beforeUser) {
      return NextResponse.json({ detail: 'Kullanıcı bulunamadı' }, { status: 404 })
    }
    
    const updatedUser = await UserService.updateUser(userId, body)
    
    await AuditService.log({
      entityType: 'user',
      entityId: userId,
      action: 'update',
      actorUserId: currentUser.id,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      beforeState: { email: beforeUser.email, role: beforeUser.role, status: beforeUser.status },
      afterState: body,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ detail: 'Kullanıcı güncellenirken hata oluştu' }, { status: 500 })
  }
}
