import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { BlogService } from '@/lib/services/blog-service'
import { AuditService } from '@/lib/services/audit-service'
import type { ServiceStatus } from '@/lib/models/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { postId } = await params
    const body = await request.json()
    const status = body?.status as ServiceStatus

    if (!['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json({ detail: 'Geçersiz durum' }, { status: 400 })
    }

    const post = await BlogService.getById(postId)
    if (!post) {
      return NextResponse.json({ detail: 'Blog yazısı bulunamadı' }, { status: 404 })
    }

    const updated = await BlogService.updateStatus(postId, status)

    await AuditService.log({
      entityType: 'blog_post',
      entityId: postId,
      action: 'status_change',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      beforeState: { status: post.status },
      afterState: { status },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })

    return NextResponse.json({ message: 'Durum güncellendi', status: updated?.status })
  } catch (error) {
    console.error('Blog status change error:', error)
    return NextResponse.json({ detail: 'Durum güncellenirken hata oluştu' }, { status: 500 })
  }
}
