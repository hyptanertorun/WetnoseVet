import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { GalleryService } from '@/lib/services/gallery-service'

// Backward compatibility route for items
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
    
    const item = await GalleryService.addItem(albumId, body)
    
    return NextResponse.json({
      id: item.id,
      message: 'Görsel eklendi'
    }, { status: 201 })
  } catch (error) {
    console.error('Add gallery item error:', error)
    return NextResponse.json({ detail: 'Görsel eklenirken hata oluştu' }, { status: 500 })
  }
}
