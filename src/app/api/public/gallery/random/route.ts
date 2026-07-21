import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { GalleryService } from '@/lib/services/gallery-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '8')
    const albumSlug = searchParams.get('album_slug')
    
    const albums = await GalleryService.getActiveAlbumsWithItems()
    
    // Collect all items
    let allItems: Array<{
      id: string
      image_url: string
      image_alt: string | null
      caption: string | null
      category: string
      album_id: string
      album_slug: string
    }> = []
    
    for (const album of albums) {
      if (albumSlug && album.slug !== albumSlug) continue
      
      for (const item of album.items) {
        allItems.push({
          id: item.id,
          image_url: item.image_url,
          image_alt: item.image_alt,
          caption: item.caption,
          category: album.title,
          album_id: album.id,
          album_slug: album.slug
        })
      }
    }
    
    // Shuffle and limit
    allItems.sort(() => Math.random() - 0.5)
    const selectedItems = allItems.slice(0, limit)
    
    const response = NextResponse.json({
      items: selectedItems,
      total: selectedItems.length,
      available: allItems.length
    })
    
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    
    return response
  } catch (error) {
    console.error('Get random gallery error:', error)
    return NextResponse.json(
      { detail: 'Galeri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
