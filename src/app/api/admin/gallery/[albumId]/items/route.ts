import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { GalleryService } from '@/lib/services/gallery-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { albumId } = await params
    const body = await request.json()
    
    if (!body.image_url) {
      return NextResponse.json({ detail: 'Görsel URL gerekli' }, { status: 400 })
    }
    
    const album = await GalleryService.getAlbumById(albumId)
    if (!album) {
      return NextResponse.json({ detail: 'Albüm bulunamadı' }, { status: 404 })
    }
    
    const item = await GalleryService.createItem({
      album_id: albumId,
      image_url: body.image_url,
      image_alt: body.image_alt,
      caption: body.caption
    })
    
    return NextResponse.json({ message: 'Görsel eklendi', id: item.id })
  } catch (error) {
    console.error('Add gallery item error:', error)
    return NextResponse.json({ detail: 'Görsel eklenirken hata oluştu' }, { status: 500 })
  }
}
