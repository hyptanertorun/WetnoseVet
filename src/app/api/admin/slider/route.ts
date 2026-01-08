import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { SliderService } from '@/lib/services/slider-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { slides, total } = await SliderService.listSlides(true)
    const settings = await SliderService.getSettings()
    
    return NextResponse.json({
      slides: slides.map(s => ({
        ...s,
        created_at: s.created_at?.toISOString() || null,
        updated_at: s.updated_at?.toISOString() || null
      })),
      total,
      settings: {
        ...settings,
        updated_at: settings.updated_at?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Get slider error:', error)
    return NextResponse.json({ detail: 'Slider alınırken hata oluştu' }, { status: 500 })
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
    
    return NextResponse.json({ message: 'Slide oluşturuldu', id: slide.id })
  } catch (error) {
    console.error('Create slide error:', error)
    return NextResponse.json({ detail: 'Slide oluşturulurken hata oluştu' }, { status: 500 })
  }
}
