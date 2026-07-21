import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { ServiceService } from '@/lib/services/service-service'
import { AuditService } from '@/lib/services/audit-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { serviceId } = await params
    const service = await ServiceService.getById(serviceId)
    
    if (!service) {
      return NextResponse.json({ detail: 'Hizmet bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Get service error:', error)
    return NextResponse.json({ detail: 'Hizmet alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { serviceId } = await params
    const body = await request.json()
    
    const beforeService = await ServiceService.getById(serviceId)
    if (!beforeService) {
      return NextResponse.json({ detail: 'Hizmet bulunamadı' }, { status: 404 })
    }
    
    const updatedService = await ServiceService.update(serviceId, body, user.id)
    
    await AuditService.log({
      entityType: 'service',
      entityId: serviceId,
      action: 'update',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      beforeState: { title: beforeService.title, status: beforeService.status },
      afterState: body,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json({ detail: 'Hizmet güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { serviceId } = await params
    
    const service = await ServiceService.getById(serviceId)
    if (!service) {
      return NextResponse.json({ detail: 'Hizmet bulunamadı' }, { status: 404 })
    }
    
    await ServiceService.archive(serviceId)
    
    await AuditService.log({
      entityType: 'service',
      entityId: serviceId,
      action: 'archive',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      metadata: { title: service.title },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({ message: 'Hizmet arşivlendi' })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json({ detail: 'Hizmet silinirken hata oluştu' }, { status: 500 })
  }
}
