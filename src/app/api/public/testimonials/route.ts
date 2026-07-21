import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { TestimonialService } from '@/lib/services/testimonial-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const testimonials = await TestimonialService.getPublicTestimonials(limit)
    
    return NextResponse.json({
      testimonials,
      total: testimonials.length
    })
  } catch (error) {
    console.error('Get public testimonials error:', error)
    return NextResponse.json(
      { detail: 'Yorumlar alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
