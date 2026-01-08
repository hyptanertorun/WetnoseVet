import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/services/blog-service'

function calculateReadingTime(content: string | null | undefined): number {
  if (!content) return 1
  const wordCount = content.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await BlogService.getPublishedBySlug(slug)
    
    if (!post) {
      return NextResponse.json(
        { detail: 'Blog yazısı bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      cover_image_url: post.cover_image_url,
      cover_image_alt: post.cover_image_alt,
      content: post.content,
      category: post.category,
      tags: post.tags,
      seo: post.seo,
      published_at: post.published_at?.toISOString() || null,
      ai_generated: post.ai_generated,
      ai_metadata: post.ai_metadata,
      reading_time: calculateReadingTime(post.content),
      view_count: post.view_count
    })
  } catch (error) {
    console.error('Get public blog post error:', error)
    return NextResponse.json(
      { detail: 'Blog yazısı alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Track blog view
  try {
    const { slug } = await params
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    
    const viewCount = await BlogService.incrementViewCount(slug, clientIp)
    
    return NextResponse.json({ view_count: viewCount })
  } catch (error) {
    console.error('Track view error:', error)
    return NextResponse.json({ view_count: 0 })
  }
}
