import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireOpsRoles, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { AppointmentService } from '@/lib/services/appointment-service'
import { AuditService } from '@/lib/services/audit-service'
import type { AppointmentStatus, LeadHeat } from '@/lib/models/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOpsRoles(request)
    if (authResult instanceof NextResponse) return authResult
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '20')
    const status = searchParams.get('status') as AppointmentStatus | undefined
    const leadHeat = searchParams.get('lead_heat') as LeadHeat | undefined
    const assignedTo = searchParams.get('assigned_to') || undefined
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sort_by') || undefined
    const sortOrder = searchParams.get('sort_order') || undefined
    
    const { appointments, total } = await AppointmentService.list(page, pageSize, {
      status,
      lead_heat: leadHeat,
      assigned_to: assignedTo,
      search,
      sort_by: sortBy,
      sort_order: sortOrder
    })
    
    return NextResponse.json({
      appointments: appointments.map(a => ({
        ...a,
        created_at: a.created_at?.toISOString() || null,
        updated_at: a.updated_at?.toISOString() || null,
        contacted_at: a.contacted_at?.toISOString() || null,
        scheduled_at: a.scheduled_at?.toISOString() || null,
        completed_at: a.completed_at?.toISOString() || null,
        follow_up_at: a.follow_up_at?.toISOString() || null,
        notes: a.notes.map(n => ({
          ...n,
          created_at: n.created_at?.toISOString() || null
        }))
      })),
      total,
      page,
      page_size: pageSize
    })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json({ detail: 'Randevular alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireOpsRoles(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const body = await request.json()
    
    if (!body.name || !body.phone) {
      return NextResponse.json({ detail: 'İsim ve telefon gerekli' }, { status: 400 })
    }
    
    const appointment = await AppointmentService.create({
      ...body,
      source: 'admin'
    })
    
    await AuditService.log({
      entityType: 'appointment',
      entityId: appointment.id,
      action: 'create',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      afterState: { name: appointment.name, phone: appointment.phone },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({ message: 'Randevu oluşturuldu', id: appointment.id })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({ detail: 'Randevu oluşturulurken hata oluştu' }, { status: 500 })
  }
}
