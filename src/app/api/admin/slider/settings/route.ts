import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { SliderService } from '@/lib/services/slider-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const settings = await SliderService.getSettings()
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get slider settings error:', error)
    return NextResponse.json({ detail: 'Slider ayarları alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const body = await request.json()
    
    const settings = await SliderService.updateSettings(body)
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update slider settings error:', error)
    return NextResponse.json({ detail: 'Slider ayarları güncellenirken hata oluştu' }, { status: 500 })
  }
}
