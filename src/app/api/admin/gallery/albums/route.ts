import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { GalleryService } from '@/lib/services/gallery-service'

// Backward compatibility route - redirects to /api/admin/gallery
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    const albums = await GalleryService.getAlbums({ limit })
    
    return NextResponse.json({
      albums: albums.map(album => ({
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
      })),
      total: albums.length
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
    const album = await GalleryService.createAlbum(body)
    
    return NextResponse.json({
      id: album.id,
      slug: album.slug,
      title: album.title,
      message: 'Albüm oluşturuldu'
    }, { status: 201 })
  } catch (error) {
    console.error('Create gallery album error:', error)
    return NextResponse.json({ detail: 'Albüm oluşturulurken hata oluştu' }, { status: 500 })
  }
}
