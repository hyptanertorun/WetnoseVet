import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/storage/uploads'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params
    
    if (!pathParts || pathParts.length === 0) {
      return NextResponse.json({ detail: 'Dosya bulunamadı' }, { status: 404 })
    }
    
    // Sanitize path to prevent directory traversal
    const sanitizedParts = pathParts.filter(p => !p.includes('..') && !p.startsWith('/'))
    const filePath = path.join(UPLOAD_DIR, ...sanitizedParts)
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ detail: 'Dosya bulunamadı' }, { status: 404 })
    }
    
    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Determine content type
    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    
    // Return file with caching headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Serve upload error:', error)
    return NextResponse.json({ detail: 'Dosya sunulurken hata oluştu' }, { status: 500 })
  }
}
