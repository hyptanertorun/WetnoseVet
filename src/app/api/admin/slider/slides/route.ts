import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { SliderService } from '@/lib/services/slider-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const url = new URL(request.url)
    const includeInactive = url.searchParams.get('include_inactive') !== 'false'
    
    const { slides, total } = await SliderService.listSlides(includeInactive)
    
    return NextResponse.json({
      slides: slides.map(s => ({
        ...s,
        created_at: s.created_at?.toISOString() || null,
        updated_at: s.updated_at?.toISOString() || null
      })),
      total
    })
  } catch (error) {
    console.error('Get slides error:', error)
    return NextResponse.json({ detail: 'Slide\'lar alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const body = await request.json()
    
    if (!body.title || !body.image_url) {
      return NextResponse.json({ detail: 'Başlık ve görsel gerekli' }, { status: 400 })
    }
    
    const slide = await SliderService.createSlide(body)
    
    return NextResponse.json({ 
      message: 'Slide oluşturuldu', 
      id: slide.id,
      slide: {
        ...slide,
        created_at: slide.created_at?.toISOString() || null,
        updated_at: slide.updated_at?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Create slide error:', error)
    return NextResponse.json({ detail: 'Slide oluşturulurken hata oluştu' }, { status: 500 })
  }
}
