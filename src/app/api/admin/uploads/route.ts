import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/storage/uploads'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = (formData.get('category') as string) || 'general'
    
    if (!file) {
      return NextResponse.json({ detail: 'Dosya gerekli' }, { status: 400 })
    }
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { detail: 'Geçersiz dosya tipi. Sadece JPEG, PNG, WebP ve GIF kabul edilir.' },
        { status: 400 }
      )
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { detail: 'Dosya boyutu 10MB\'dan büyük olamaz' },
        { status: 400 }
      )
    }
    
    // Create category directory if not exists
    const categoryDir = path.join(UPLOAD_DIR, category)
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true })
    }
    
    // Generate unique filename
    const ext = path.extname(file.name) || '.jpg'
    const filename = `${uuidv4()}${ext}`
    const filepath = path.join(categoryDir, filename)
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)
    
    // Return URL
    const url = `/api/uploads/${category}/${filename}`
    
    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ detail: 'Dosya yüklenirken hata oluştu' }, { status: 500 })
  }
}
