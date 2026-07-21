import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { ServiceService } from '@/lib/services/service-service'
import type { ServiceStatus } from '@/lib/models/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { serviceId } = await params
    const body = await request.json()
    const { status } = body as { status: ServiceStatus }
    
    if (!status) {
      return NextResponse.json({ detail: 'Status gerekli' }, { status: 400 })
    }
    
    const service = await ServiceService.updateStatus(serviceId, status)
    
    if (!service) {
      return NextResponse.json({ detail: 'Hizmet bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Update service status error:', error)
    return NextResponse.json({ detail: 'Status güncellenirken hata oluştu' }, { status: 500 })
  }
}
