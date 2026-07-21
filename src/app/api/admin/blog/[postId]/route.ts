import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { BlogService } from '@/lib/services/blog-service'
import { AuditService } from '@/lib/services/audit-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { postId } = await params
    const post = await BlogService.getById(postId)
    
    if (!post) {
      return NextResponse.json({ detail: 'Blog yazısı bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Get blog post error:', error)
    return NextResponse.json({ detail: 'Blog yazısı alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { postId } = await params
    const body = await request.json()
    
    const beforePost = await BlogService.getById(postId)
    if (!beforePost) {
      return NextResponse.json({ detail: 'Blog yazısı bulunamadı' }, { status: 404 })
    }
    
    const updatedPost = await BlogService.update(postId, body, user.id)
    
    await AuditService.log({
      entityType: 'blog_post',
      entityId: postId,
      action: 'update',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      beforeState: { title: beforePost.title, status: beforePost.status },
      afterState: body,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Update blog post error:', error)
    return NextResponse.json({ detail: 'Blog yazısı güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { postId } = await params
    
    const post = await BlogService.getById(postId)
    if (!post) {
      return NextResponse.json({ detail: 'Blog yazısı bulunamadı' }, { status: 404 })
    }
    
    await BlogService.archive(postId)
    
    await AuditService.log({
      entityType: 'blog_post',
      entityId: postId,
      action: 'archive',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      metadata: { title: post.title },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({ message: 'Blog yazısı arşivlendi' })
  } catch (error) {
    console.error('Delete blog post error:', error)
    return NextResponse.json({ detail: 'Blog yazısı silinirken hata oluştu' }, { status: 500 })
  }
}
