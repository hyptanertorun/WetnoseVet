import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { TestimonialService } from '@/lib/services/testimonial-service'
import { AuditService } from '@/lib/services/audit-service'
import type { TestimonialStatus } from '@/lib/models/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { testimonialId } = await params
    const body = await request.json()
    const { status } = body as { status: TestimonialStatus }
    
    if (!status) {
      return NextResponse.json({ detail: 'Status gerekli' }, { status: 400 })
    }
    
    const testimonial = await TestimonialService.updateStatus(
      testimonialId,
      status,
      user.id,
      user.email
    )
    
    if (!testimonial) {
      return NextResponse.json({ detail: 'Yorum bulunamadı' }, { status: 404 })
    }
    
    await AuditService.log({
      entityType: 'testimonial',
      entityId: testimonialId,
      action: 'status_change',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      afterState: { status },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Update testimonial status error:', error)
    return NextResponse.json({ detail: 'Status güncellenirken hata oluştu' }, { status: 500 })
  }
}
