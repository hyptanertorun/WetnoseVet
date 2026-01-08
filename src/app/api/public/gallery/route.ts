import { NextRequest, NextResponse } from 'next/server'
import { GalleryService } from '@/lib/services/gallery-service'

export async function GET() {
  try {
    const albums = await GalleryService.getActiveAlbumsWithItems()
    
    return NextResponse.json({
      albums,
      total: albums.length
    })
  } catch (error) {
    console.error('Get public gallery error:', error)
    return NextResponse.json(
      { detail: 'Galeri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
