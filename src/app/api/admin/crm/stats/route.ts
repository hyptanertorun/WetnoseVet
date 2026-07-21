import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireOpsRoles } from '@/lib/middleware/auth'
import { AppointmentService } from '@/lib/services/appointment-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOpsRoles(request)
    if (authResult instanceof NextResponse) return authResult
    
    const stats = await AppointmentService.getStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get CRM stats error:', error)
    return NextResponse.json({ detail: 'CRM istatistikleri alınırken hata oluştu' }, { status: 500 })
  }
}
