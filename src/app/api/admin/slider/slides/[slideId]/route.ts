import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { SliderService } from '@/lib/services/slider-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { slideId } = await params
    const slide = await SliderService.getSlideById(slideId)
    
    if (!slide) {
      return NextResponse.json({ detail: 'Slide bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({
      ...slide,
      created_at: slide.created_at?.toISOString() || null,
      updated_at: slide.updated_at?.toISOString() || null
    })
  } catch (error) {
    console.error('Get slide error:', error)
    return NextResponse.json({ detail: 'Slide alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { slideId } = await params
    const body = await request.json()
    
    const slide = await SliderService.updateSlide(slideId, body)
    
    if (!slide) {
      return NextResponse.json({ detail: 'Slide bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({
      message: 'Slide güncellendi',
      slide: {
        ...slide,
        created_at: slide.created_at?.toISOString() || null,
        updated_at: slide.updated_at?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Update slide error:', error)
    return NextResponse.json({ detail: 'Slide güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { slideId } = await params
    const deleted = await SliderService.deleteSlide(slideId)
    
    if (!deleted) {
      return NextResponse.json({ detail: 'Slide bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Slide silindi' })
  } catch (error) {
    console.error('Delete slide error:', error)
    return NextResponse.json({ detail: 'Slide silinirken hata oluştu' }, { status: 500 })
  }
}
