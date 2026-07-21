import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { GalleryService } from '@/lib/services/gallery-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { albums, total } = await GalleryService.listAlbums()
    const stats = await GalleryService.getStats()
    
    // Get item counts for each album
    const albumsWithCounts = await Promise.all(
      albums.map(async (album) => {
        const items = await GalleryService.getItemsByAlbum(album.id)
        return {
          title: album.title,
          count: items.length
        }
      })
    )
    
    const activeAlbums = albums.filter(a => a.status === 'published').length
    
    return NextResponse.json({
      total_albums: total,
      active_albums: activeAlbums,
      total_images: stats.total_items,
      albums: albumsWithCounts
    })
  } catch (error) {
    console.error('Get gallery stats error:', error)
    return NextResponse.json({ detail: 'Galeri istatistikleri alınırken hata oluştu' }, { status: 500 })
  }
}
