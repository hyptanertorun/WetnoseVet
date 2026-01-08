import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    
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
      must_change_password: user.must_change_password
    })
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { detail: 'Kullanıcı bilgileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
