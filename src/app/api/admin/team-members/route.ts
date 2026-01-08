import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { TeamService } from '@/lib/services/team-service'
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
    
    const { members, total } = await TeamService.list(page, limit, { status, archived, search })
    
    return NextResponse.json({
      team_members: members.map(m => ({
        id: m.id,
        full_name: m.full_name,
        slug: m.slug,
        role_title: m.role_title,
        specialties: m.specialties,
        bio: m.bio,
        photo_url: m.photo_url,
        photo_alt: m.photo_alt,
        social_links: m.social_links,
        experience: m.experience,
        quote: m.quote,
        is_owner: m.is_owner,
        status: m.status,
        sort_order: m.sort_order,
        archived_at: m.archived_at?.toISOString() || null,
        created_at: m.created_at?.toISOString() || null,
        updated_at: m.updated_at?.toISOString() || null
      })),
      total,
      page,
      page_size: limit
    })
  } catch (error) {
    console.error('Get team members error:', error)
    return NextResponse.json({ detail: 'Ekip üyeleri alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const body = await request.json()
    
    if (!body.full_name || !body.role_title || !body.photo_url) {
      return NextResponse.json(
        { detail: 'İsim, rol ve fotoğraf gerekli' },
        { status: 400 }
      )
    }
    
    const member = await TeamService.create(body)
    
    await AuditService.log({
      entityType: 'team_member',
      entityId: member.id,
      action: 'create',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      afterState: { full_name: member.full_name, slug: member.slug },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({
      message: 'Ekip üyesi başarıyla oluşturuldu',
      id: member.id,
      slug: member.slug
    })
  } catch (error) {
    console.error('Create team member error:', error)
    return NextResponse.json({ detail: 'Ekip üyesi oluşturulurken hata oluştu' }, { status: 500 })
  }
}
