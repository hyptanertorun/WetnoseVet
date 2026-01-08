import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { ServiceService } from '@/lib/services/service-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { serviceId } = await params
    const service = await ServiceService.restore(serviceId)
    
    if (!service) {
      return NextResponse.json({ detail: 'Hizmet bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Restore service error:', error)
    return NextResponse.json({ detail: 'Hizmet geri yüklenirken hata oluştu' }, { status: 500 })
  }
}
