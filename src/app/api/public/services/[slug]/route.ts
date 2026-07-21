import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { ServiceService } from '@/lib/services/service-service'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const service = await ServiceService.getPublishedBySlug(slug)
    
    if (!service) {
      return NextResponse.json(
        { detail: 'Hizmet bulunamadı' },
        { status: 404 }
      )
    }

    // Related published blog posts and team members (providers) for this service
    const [blogCollection, teamCollection] = await Promise.all([
      getCollection(COLLECTIONS.BLOG_POSTS),
      getCollection(COLLECTIONS.TEAM_MEMBERS)
    ])
    const [relatedPosts, providers] = await Promise.all([
      blogCollection
        .find(
          { status: 'published', related_service_ids: service.id },
          { projection: { _id: 0, title: 1, slug: 1, excerpt: 1, cover_image_url: 1, category: 1 } }
        )
        .sort({ published_at: -1 })
        .limit(3)
        .toArray(),
      teamCollection
        .find(
          { status: 'published', service_ids: service.id },
          { projection: { _id: 0, full_name: 1, slug: 1, role_title: 1, photo_url: 1 } }
        )
        .sort({ sort_order: 1 })
        .limit(6)
        .toArray()
    ])
    
    return NextResponse.json({
      id: service.id,
      title: service.title,
      slug: service.slug,
      short_description: service.short_description,
      long_description: service.long_description,
      cover_image_url: service.cover_image_url,
      cover_image_alt: service.cover_image_alt,
      icon: service.icon,
      price_mode: service.price_mode,
      price_value: service.price_value,
      tags: service.tags,
      category: service.category,
      seo: service.seo,
      related_blog_posts: relatedPosts,
      providers
    })
  } catch (error) {
    console.error('Get public service error:', error)
    return NextResponse.json(
      { detail: 'Hizmet alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
