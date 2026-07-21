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
    const album = await GalleryService.getAlbumById(albumId)
    
    if (!album) {
      return NextResponse.json({ detail: 'Albüm bulunamadı' }, { status: 404 })
    }
    
    const items = await GalleryService.getItemsByAlbum(albumId)
    
    return NextResponse.json({
      ...album,
      items: items.map(i => ({
        id: i.id,
        image_url: i.image_url,
        image_alt: i.image_alt,
        caption: i.caption,
        sort_order: i.sort_order,
        created_at: i.created_at?.toISOString() || null
      }))
    })
  } catch (error) {
    console.error('Get gallery album error:', error)
    return NextResponse.json({ detail: 'Albüm alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { albumId } = await params
    const body = await request.json()
    
    const album = await GalleryService.updateAlbum(albumId, body)
    
    if (!album) {
      return NextResponse.json({ detail: 'Albüm bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(album)
  } catch (error) {
    console.error('Update gallery album error:', error)
    return NextResponse.json({ detail: 'Albüm güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { albumId } = await params
    
    const deleted = await GalleryService.deleteAlbum(albumId)
    
    if (!deleted) {
      return NextResponse.json({ detail: 'Albüm bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Albüm silindi' })
  } catch (error) {
    console.error('Delete gallery album error:', error)
    return NextResponse.json({ detail: 'Albüm silinirken hata oluştu' }, { status: 500 })
  }
}
