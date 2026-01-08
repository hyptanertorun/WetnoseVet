import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { ClinicRhythmService } from '@/lib/services/clinic-rhythm-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { entryId } = await params
    const entry = await ClinicRhythmService.getById(entryId)
    
    if (!entry) {
      return NextResponse.json({ detail: 'Giriş bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(entry)
  } catch (error) {
    console.error('Get clinic rhythm entry error:', error)
    return NextResponse.json({ detail: 'Giriş alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { entryId } = await params
    const body = await request.json()
    
    const entry = await ClinicRhythmService.update(entryId, body)
    
    if (!entry) {
      return NextResponse.json({ detail: 'Giriş bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(entry)
  } catch (error) {
    console.error('Update clinic rhythm entry error:', error)
    return NextResponse.json({ detail: 'Giriş güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { entryId } = await params
    
    const deleted = await ClinicRhythmService.delete(entryId)
    
    if (!deleted) {
      return NextResponse.json({ detail: 'Giriş bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Giriş silindi' })
  } catch (error) {
    console.error('Delete clinic rhythm entry error:', error)
    return NextResponse.json({ detail: 'Giriş silinirken hata oluştu' }, { status: 500 })
  }
}
