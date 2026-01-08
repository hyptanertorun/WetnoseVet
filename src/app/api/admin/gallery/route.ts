import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { GalleryService } from '@/lib/services/gallery-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { albums, total } = await GalleryService.listAlbums()
    
    // Get item counts for each album
    const albumsWithCounts = await Promise.all(
      albums.map(async (album) => {
        const items = await GalleryService.getItemsByAlbum(album.id)
        return {
          ...album,
          created_at: album.created_at?.toISOString() || null,
          updated_at: album.updated_at?.toISOString() || null,
          item_count: items.length
        }
      })
    )
    
    const stats = await GalleryService.getStats()
    
    return NextResponse.json({
      albums: albumsWithCounts,
      total,
      stats
    })
  } catch (error) {
    console.error('Get gallery albums error:', error)
    return NextResponse.json({ detail: 'Albümler alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const body = await request.json()
    
    if (!body.title) {
      return NextResponse.json({ detail: 'Albüm adı gerekli' }, { status: 400 })
    }
    
    const album = await GalleryService.createAlbum(body)
    
    return NextResponse.json({ message: 'Albüm oluşturuldu', id: album.id, slug: album.slug })
  } catch (error) {
    console.error('Create gallery album error:', error)
    return NextResponse.json({ detail: 'Albüm oluşturulurken hata oluştu' }, { status: 500 })
  }
}
