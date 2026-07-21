import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { ServiceService } from '@/lib/services/service-service'

export async function GET() {
  try {
    const services = await ServiceService.getPublished()
    
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
        seo: s.seo
      })),
      total: services.length
    })
  } catch (error) {
    console.error('Get public services error:', error)
    return NextResponse.json(
      { detail: 'Hizmetler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
