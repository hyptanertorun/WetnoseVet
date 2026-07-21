import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireOpsRoles } from '@/lib/middleware/auth'
import { AppointmentService } from '@/lib/services/appointment-service'
import type { AppointmentStatus } from '@/lib/models/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const authResult = await requireOpsRoles(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { appointmentId } = await params
    const body = await request.json()
    const { status } = body as { status: AppointmentStatus }
    
    if (!status) {
      return NextResponse.json({ detail: 'Status gerekli' }, { status: 400 })
    }
    
    const appointment = await AppointmentService.updateStatus(appointmentId, status)
    
    if (!appointment) {
      return NextResponse.json({ detail: 'Randevu bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Update appointment status error:', error)
    return NextResponse.json({ detail: 'Status güncellenirken hata oluştu' }, { status: 500 })
  }
}
