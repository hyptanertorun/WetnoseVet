import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { BlogCategoryService } from '@/lib/services/blog-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const categories = await BlogCategoryService.list()
    
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Get blog categories error:', error)
    return NextResponse.json({ detail: 'Kategoriler alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json({ detail: 'Kategori adı gerekli' }, { status: 400 })
    }
    
    const category = await BlogCategoryService.create(body)
    
    return NextResponse.json({ message: 'Kategori oluşturuldu', id: category.id })
  } catch (error) {
    console.error('Create blog category error:', error)
    return NextResponse.json({ detail: 'Kategori oluşturulurken hata oluştu' }, { status: 500 })
  }
}
