import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { ContactService } from '@/lib/services/contact-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const stats = await ContactService.getStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get contact stats error:', error)
    return NextResponse.json({ detail: 'İletişim istatistikleri alınırken hata oluştu' }, { status: 500 })
  }
}
