import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrManager, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { UserService } from '@/lib/services/user-service'
import { AuditService } from '@/lib/services/audit-service'
import type { UserRole, UserStatus } from '@/lib/models/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminOrManager(request)
    if (authResult instanceof NextResponse) return authResult
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '20')
    const role = searchParams.get('role') as UserRole | undefined
    const status = searchParams.get('status') as UserStatus | undefined
    
    const { users, total } = await UserService.listUsers(page, pageSize, role, status)
    
    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        status: u.status,
        phone: u.phone,
        avatar_url: u.avatar_url,
        last_login: u.last_login?.toISOString() || null,
        created_at: u.created_at?.toISOString() || null,
        updated_at: u.updated_at?.toISOString() || null,
        must_change_password: u.must_change_password
      })),
      total,
      page,
      page_size: pageSize
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ detail: 'Kullanıcılar alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminOrManager(request)
    if (authResult instanceof NextResponse) return authResult
    const { user: currentUser } = authResult
    
    const body = await request.json()
    const { email, password, full_name, role = 'editor', phone } = body
    
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { detail: 'E-posta, şifre ve isim gerekli' },
        { status: 400 }
      )
    }
    
    const newUser = await UserService.createUser(
      email,
      password,
      full_name,
      role,
      phone,
      currentUser.id
    )
    
    if (!newUser) {
      return NextResponse.json(
        { detail: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }
    
    await AuditService.log({
      entityType: 'user',
      entityId: newUser.id,
      action: 'create',
      actorUserId: currentUser.id,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      afterState: { email: newUser.email, full_name: newUser.full_name, role: newUser.role },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user_id: newUser.id
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ detail: 'Kullanıcı oluşturulurken hata oluştu' }, { status: 500 })
  }
}
