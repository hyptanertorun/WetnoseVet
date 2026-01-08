import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { TestimonialService } from '@/lib/services/testimonial-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const analytics = await TestimonialService.getAnalytics()
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Get testimonials analytics error:', error)
    return NextResponse.json({ detail: 'Analitik verileri alınırken hata oluştu' }, { status: 500 })
  }
}
