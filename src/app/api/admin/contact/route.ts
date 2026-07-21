import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { ContactService } from '@/lib/services/contact-service'
import type { ContactStatus } from '@/lib/models/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as ContactStatus | undefined
    const search = searchParams.get('search') || undefined
    
    const { messages, total } = await ContactService.list(page, limit, { status, search })
    const stats = await ContactService.getStats()
    
    return NextResponse.json({
      messages: messages.map(m => ({
        ...m,
        created_at: m.created_at?.toISOString() || null,
        read_at: m.read_at?.toISOString() || null,
        replied_at: m.replied_at?.toISOString() || null
      })),
      total,
      page,
      page_size: limit,
      stats
    })
  } catch (error) {
    console.error('Get contact messages error:', error)
    return NextResponse.json({ detail: 'İletiler alınırken hata oluştu' }, { status: 500 })
  }
}
