import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@/lib/services/blog-service'

function calculateReadingTime(content: string | null | undefined): number {
  if (!content) return 1
  const wordCount = content.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

export async function GET() {
  try {
    const { posts, total } = await BlogService.getPublished()
    
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
        published_at: p.published_at?.toISOString() || null,
        reading_time: calculateReadingTime(p.content)
      })),
      total
    })
  } catch (error) {
    console.error('Get public blog posts error:', error)
    return NextResponse.json(
      { detail: 'Blog yazıları alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
