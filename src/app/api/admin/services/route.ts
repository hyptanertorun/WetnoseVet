import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { ServiceService } from '@/lib/services/service-service'
import { AuditService } from '@/lib/services/audit-service'
import type { ServiceStatus } from '@/lib/models/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as ServiceStatus | undefined
    const archived = searchParams.get('archived') === 'true'
    const search = searchParams.get('search') || undefined
    
    const { services, total } = await ServiceService.list(page, limit, { status, archived, search })
    
    return NextResponse.json({
      services: services.map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        short_description: s.short_description,
        long_description: s.long_description,
        cover_image_url: s.cover_image_url,
        cover_image_alt: s.cover_image_alt,
        icon: s.icon,
        price_mode: s.price_mode,
        price_value: s.price_value,
        tags: s.tags,
        category: s.category,
        seo: s.seo,
        status: s.status,
        sort_order: s.sort_order,
        archived_at: s.archived_at?.toISOString() || null,
        created_at: s.created_at?.toISOString() || null,
        updated_at: s.updated_at?.toISOString() || null
      })),
      total,
      page,
      page_size: limit
    })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json({ detail: 'Hizmetler alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const body = await request.json()
    
    if (!body.title || !body.short_description || !body.cover_image_url) {
      return NextResponse.json(
        { detail: 'Başlık, kısa açıklama ve kapak görseli gerekli' },
        { status: 400 }
      )
    }
    
    const service = await ServiceService.create({
      ...body,
      created_by: user.id
    })
    
    await AuditService.log({
      entityType: 'service',
      entityId: service.id,
      action: 'create',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      afterState: { title: service.title, slug: service.slug },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({
      message: 'Hizmet başarıyla oluşturuldu',
      id: service.id,
      slug: service.slug
    })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json({ detail: 'Hizmet oluşturulurken hata oluştu' }, { status: 500 })
  }
}
