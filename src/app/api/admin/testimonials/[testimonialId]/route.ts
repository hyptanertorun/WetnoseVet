import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { TestimonialService } from '@/lib/services/testimonial-service'
import { AuditService } from '@/lib/services/audit-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { testimonialId } = await params
    const testimonial = await TestimonialService.getById(testimonialId)
    
    if (!testimonial) {
      return NextResponse.json({ detail: 'Yorum bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Get testimonial error:', error)
    return NextResponse.json({ detail: 'Yorum alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { testimonialId } = await params
    const body = await request.json()
    
    const beforeTestimonial = await TestimonialService.getById(testimonialId)
    if (!beforeTestimonial) {
      return NextResponse.json({ detail: 'Yorum bulunamadı' }, { status: 404 })
    }
    
    const updatedTestimonial = await TestimonialService.update(testimonialId, body)
    
    await AuditService.log({
      entityType: 'testimonial',
      entityId: testimonialId,
      action: 'update',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      beforeState: { status: beforeTestimonial.status },
      afterState: body,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json(updatedTestimonial)
  } catch (error) {
    console.error('Update testimonial error:', error)
    return NextResponse.json({ detail: 'Yorum güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { testimonialId } = await params
    
    const testimonial = await TestimonialService.getById(testimonialId)
    if (!testimonial) {
      return NextResponse.json({ detail: 'Yorum bulunamadı' }, { status: 404 })
    }
    
    await TestimonialService.delete(testimonialId)
    
    await AuditService.log({
      entityType: 'testimonial',
      entityId: testimonialId,
      action: 'delete',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      metadata: { full_name: testimonial.full_name },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({ message: 'Yorum silindi' })
  } catch (error) {
    console.error('Delete testimonial error:', error)
    return NextResponse.json({ detail: 'Yorum silinirken hata oluştu' }, { status: 500 })
  }
}
