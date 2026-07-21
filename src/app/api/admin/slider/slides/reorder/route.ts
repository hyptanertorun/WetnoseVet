import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { SliderService } from '@/lib/services/slider-service'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const body = await request.json()
    
    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ detail: 'items dizisi gerekli' }, { status: 400 })
    }
    
    await SliderService.reorderSlides(body.items)
    
    return NextResponse.json({ message: 'Sıralama güncellendi' })
  } catch (error) {
    console.error('Reorder slides error:', error)
    return NextResponse.json({ detail: 'Sıralama güncellenirken hata oluştu' }, { status: 500 })
  }
}
