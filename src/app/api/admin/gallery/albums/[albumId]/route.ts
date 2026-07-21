import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { GalleryService } from '@/lib/services/gallery-service'

// Backward compatibility route for /api/admin/gallery/albums/[albumId]
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
    
    return NextResponse.json({
      id: album.id,
      _id: album.id,
      title: album.title,
      slug: album.slug,
      description: album.description,
      cover_image_url: album.cover_image_url,
      status: album.status,
      item_count: album.item_count || 0,
      created_at: album.created_at?.toISOString() || null,
      updated_at: album.updated_at?.toISOString() || null
    })
  } catch (error) {
    console.error('Get album error:', error)
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
    
    return NextResponse.json({
      id: album.id,
      title: album.title,
      slug: album.slug,
      message: 'Albüm güncellendi'
    })
  } catch (error) {
    console.error('Update album error:', error)
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
    await GalleryService.deleteAlbum(albumId)
    
    return NextResponse.json({ message: 'Albüm silindi' })
  } catch (error) {
    console.error('Delete album error:', error)
    return NextResponse.json({ detail: 'Albüm silinirken hata oluştu' }, { status: 500 })
  }
}
