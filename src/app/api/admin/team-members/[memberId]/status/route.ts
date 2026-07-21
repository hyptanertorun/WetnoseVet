import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { TeamService } from '@/lib/services/team-service'
import type { ServiceStatus } from '@/lib/models/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { memberId } = await params
    const body = await request.json()
    const { status } = body as { status: ServiceStatus }
    
    if (!status) {
      return NextResponse.json({ detail: 'Status gerekli' }, { status: 400 })
    }
    
    const member = await TeamService.updateStatus(memberId, status)
    
    if (!member) {
      return NextResponse.json({ detail: 'Ekip üyesi bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(member)
  } catch (error) {
    console.error('Update team member status error:', error)
    return NextResponse.json({ detail: 'Status güncellenirken hata oluştu' }, { status: 500 })
  }
}
