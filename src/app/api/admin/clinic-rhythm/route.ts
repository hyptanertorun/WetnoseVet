import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { ClinicRhythmService, PoolService } from '@/lib/services/clinic-rhythm-service'
import type { ServiceStatus } from '@/lib/models/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as ServiceStatus | undefined
    
    const { entries, total } = await ClinicRhythmService.list(page, limit, { status })
    const poolStats = await PoolService.getStats()
    
    return NextResponse.json({
      entries: entries.map(e => ({
        ...e,
        created_at: e.created_at?.toISOString() || null,
        updated_at: e.updated_at?.toISOString() || null
      })),
      total,
      page,
      page_size: limit,
      pool_stats: poolStats
    })
  } catch (error) {
    console.error('Get clinic rhythm error:', error)
    return NextResponse.json({ detail: 'Klinik ritmi alınırken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const body = await request.json()
    
    if (!body.date_key) {
      return NextResponse.json({ detail: 'Tarih gerekli' }, { status: 400 })
    }
    
    // Check if entry exists for date
    const existing = await ClinicRhythmService.getByDateKey(body.date_key)
    if (existing) {
      return NextResponse.json(
        { detail: 'Bu tarih için zaten bir giriş mevcut' },
        { status: 400 }
      )
    }
    
    const entry = await ClinicRhythmService.create({
      ...body,
      created_by: user.id
    })
    
    return NextResponse.json({ message: 'Giriş oluşturuldu', id: entry.id })
  } catch (error) {
    console.error('Create clinic rhythm error:', error)
    return NextResponse.json({ detail: 'Giriş oluşturulurken hata oluştu' }, { status: 500 })
  }
}
