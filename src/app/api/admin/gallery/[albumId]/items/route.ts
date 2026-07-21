import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { GalleryService } from '@/lib/services/gallery-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { albumId } = await params
    const items = await GalleryService.getItemsByAlbum(albumId)
    
    return NextResponse.json({
      items: items.map(item => ({
        id: item.id,
        album_id: item.album_id,
        image_url: item.image_url,
        image_alt: item.image_alt,
        caption: item.caption,
        sort_order: item.sort_order,
        created_at: item.created_at?.toISOString() || null
      })),
      total: items.length
    })
  } catch (error) {
    console.error('Get gallery items error:', error)
    return NextResponse.json({ detail: 'Görseller alınırken hata oluştu' }, { status: 500 })
  }
}

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
