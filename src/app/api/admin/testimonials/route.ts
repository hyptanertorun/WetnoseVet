import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { TestimonialService } from '@/lib/services/testimonial-service'
import { AuditService } from '@/lib/services/audit-service'
import type { TestimonialStatus, FeedbackType } from '@/lib/models/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '20')
    const status = searchParams.get('status') as TestimonialStatus | undefined
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined
    const feedbackType = searchParams.get('feedback_type') as FeedbackType | undefined
    const search = searchParams.get('search') || undefined
    const includeArchived = searchParams.get('include_archived') === 'true'
    const sortBy = searchParams.get('sort_by') || undefined
    const sortOrder = searchParams.get('sort_order') || undefined
    
    const { testimonials, total } = await TestimonialService.list(page, pageSize, {
      status,
      rating,
      feedback_type: feedbackType,
      search,
      include_archived: includeArchived,
      sort_by: sortBy,
      sort_order: sortOrder
    })
    
    return NextResponse.json({
      testimonials: testimonials.map(t => ({
        ...t,
        submitted_at: t.submitted_at?.toISOString() || null,
        approved_at: t.approved_at?.toISOString() || null,
        archived_at: t.archived_at?.toISOString() || null
      })),
      total,
      page,
      page_size: pageSize
    })
  } catch (error) {
    console.error('Get testimonials error:', error)
    return NextResponse.json({ detail: 'Yorumlar alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const body = await request.json()
    
    if (!body.full_name || !body.pet_name || !body.rating || !body.comment) {
      return NextResponse.json({ detail: 'Gerekli alanlar eksik' }, { status: 400 })
    }
    
    const testimonial = await TestimonialService.create({
      ...body,
      source: 'admin'
    })
    
    await AuditService.log({
      entityType: 'testimonial',
      entityId: testimonial.id,
      action: 'create',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      afterState: { full_name: testimonial.full_name, rating: testimonial.rating },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({ message: 'Yorum oluşturuldu', id: testimonial.id })
  } catch (error) {
    console.error('Create testimonial error:', error)
    return NextResponse.json({ detail: 'Yorum oluşturulurken hata oluştu' }, { status: 500 })
  }
}
