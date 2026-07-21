import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { BlogService } from '@/lib/services/blog-service'
import { AuditService } from '@/lib/services/audit-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { postId } = await params
    const restored = await BlogService.restore(postId)
    if (!restored) {
      return NextResponse.json({ detail: 'Blog yazısı bulunamadı' }, { status: 404 })
    }

    await AuditService.log({
      entityType: 'blog_post',
      entityId: postId,
      action: 'restore',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      metadata: { title: restored.title },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })

    return NextResponse.json({ message: 'Blog yazısı geri yüklendi' })
  } catch (error) {
    console.error('Blog restore error:', error)
    return NextResponse.json({ detail: 'Geri yükleme sırasında hata oluştu' }, { status: 500 })
  }
}
