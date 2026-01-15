import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'

// PUT: Update role permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.user) {
      return NextResponse.json(
        { detail: authResult.error || 'Yetkisiz erişim' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { detail: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const { role } = params
    
    // Admin role permissions cannot be changed
    if (role === 'admin') {
      return NextResponse.json(
        { detail: 'Admin rolü yetkileri değiştirilemez' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { permissions } = body

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { detail: 'Geçersiz yetki listesi' },
        { status: 400 }
      )
    }

    // In a real implementation, you would save this to the database
    // For now, we'll just return success
    console.log(`Updating permissions for role ${role}:`, permissions)

    return NextResponse.json({
      message: 'Yetkiler güncellendi',
      role,
      permissions
    })
  } catch (error) {
    console.error('Failed to update role permissions:', error)
    return NextResponse.json(
      { detail: 'Yetkiler güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
