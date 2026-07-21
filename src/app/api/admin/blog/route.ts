import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { BlogService } from '@/lib/services/blog-service'
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
    const category = searchParams.get('category') || undefined
    
    const { posts, total } = await BlogService.list(page, limit, { status, archived, search, category })
    
    return NextResponse.json({
      posts: posts.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        cover_image_url: p.cover_image_url,
        cover_image_alt: p.cover_image_alt,
        category: p.category,
        tags: p.tags,
        seo: p.seo,
        status: p.status,
        published_at: p.published_at?.toISOString() || null,
        ai_generated: p.ai_generated,
        view_count: p.view_count,
        archived_at: p.archived_at?.toISOString() || null,
        created_at: p.created_at?.toISOString() || null,
        updated_at: p.updated_at?.toISOString() || null
      })),
      total,
      page,
      page_size: limit
    })
  } catch (error) {
    console.error('Get blog posts error:', error)
    return NextResponse.json({ detail: 'Blog yazıları alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const body = await request.json()
    
    if (!body.title) {
      return NextResponse.json({ detail: 'Başlık gerekli' }, { status: 400 })
    }
    
    const post = await BlogService.create({ ...body, created_by: user.id })
    
    await AuditService.log({
      entityType: 'blog_post',
      entityId: post.id,
      action: 'create',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      afterState: { title: post.title, slug: post.slug },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({ message: 'Blog yazısı oluşturuldu', id: post.id, slug: post.slug })
  } catch (error) {
    console.error('Create blog post error:', error)
    return NextResponse.json({ detail: 'Blog yazısı oluşturulurken hata oluştu' }, { status: 500 })
  }
}
