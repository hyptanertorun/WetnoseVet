import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { TeamService } from '@/lib/services/team-service'

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const body = await request.json()
    const { items } = body as { items: Array<{ id: string; sort_order: number }> }
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ detail: 'Items gerekli' }, { status: 400 })
    }
    
    await TeamService.reorder(items)
    
    return NextResponse.json({ message: 'Sıralama güncellendi' })
  } catch (error) {
    console.error('Reorder team members error:', error)
    return NextResponse.json({ detail: 'Sıralama güncellenirken hata oluştu' }, { status: 500 })
  }
}
