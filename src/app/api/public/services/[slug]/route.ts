import { NextRequest, NextResponse } from 'next/server'
import { ServiceService } from '@/lib/services/service-service'

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
      seo: service.seo
    })
  } catch (error) {
    console.error('Get public service error:', error)
    return NextResponse.json(
      { detail: 'Hizmet alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
