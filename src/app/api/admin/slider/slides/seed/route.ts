import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { SliderService } from '@/lib/services/slider-service'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const slides = await SliderService.seedSlides()
    
    return NextResponse.json({ 
      message: 'Örnek slide\'lar oluşturuldu',
      count: slides.length
    })
  } catch (error) {
    console.error('Seed slides error:', error)
    return NextResponse.json({ detail: 'Örnek slide\'lar oluşturulurken hata oluştu' }, { status: 500 })
  }
}
