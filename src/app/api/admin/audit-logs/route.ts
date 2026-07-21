import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminOrManager } from '@/lib/middleware/auth'
import { AuditService } from '@/lib/services/audit-service'
import type { AuditAction } from '@/lib/models/types'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminOrManager(request)
    if (authResult instanceof NextResponse) return authResult
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '50')
    const entityType = searchParams.get('entity_type') || undefined
    const action = searchParams.get('action') as AuditAction | undefined
    const actorUserId = searchParams.get('actor_user_id') || undefined
    
    const { logs, total } = await AuditService.getLogs(page, pageSize, {
      entityType,
      action,
      actorUserId
    })
    
    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        actor_user_id: log.actor_user_id,
        actor_email: log.actor_email,
        actor_role: log.actor_role,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        action: log.action,
        before_state: log.before_state,
        after_state: log.after_state,
        metadata: log.metadata,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        timestamp: log.timestamp?.toISOString() || null,
        success: log.success,
        error_message: log.error_message
      })),
      total,
      page,
      page_size: pageSize
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json({ detail: 'Audit logları alınırken hata oluştu' }, { status: 500 })
  }
}
