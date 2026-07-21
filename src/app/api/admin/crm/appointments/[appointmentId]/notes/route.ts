import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { AppointmentService } from '@/lib/services/appointment-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { appointmentId } = await params
    const body = await request.json()
    const { content } = body
    
    if (!content) {
      return NextResponse.json({ detail: 'Not içeriği gerekli' }, { status: 400 })
    }
    
    const appointment = await AppointmentService.addNote(
      appointmentId,
      content,
      user.id,
      user.email
    )
    
    if (!appointment) {
      return NextResponse.json({ detail: 'Randevu bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Not eklendi', notes: appointment.notes })
  } catch (error) {
    console.error('Add appointment note error:', error)
    return NextResponse.json({ detail: 'Not eklenirken hata oluştu' }, { status: 500 })
  }
}
