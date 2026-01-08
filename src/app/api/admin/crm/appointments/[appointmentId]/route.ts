import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { AppointmentService } from '@/lib/services/appointment-service'
import type { AppointmentStatus } from '@/lib/models/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { appointmentId } = await params
    const appointment = await AppointmentService.getById(appointmentId)
    
    if (!appointment) {
      return NextResponse.json({ detail: 'Randevu bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json({ detail: 'Randevu alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { appointmentId } = await params
    const body = await request.json()
    
    const appointment = await AppointmentService.update(appointmentId, body)
    
    if (!appointment) {
      return NextResponse.json({ detail: 'Randevu bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json({ detail: 'Randevu güncellenirken hata oluştu' }, { status: 500 })
  }
}
