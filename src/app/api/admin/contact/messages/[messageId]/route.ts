import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireOpsRoles } from '@/lib/middleware/auth'
import { ContactService } from '@/lib/services/contact-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const authResult = await requireOpsRoles(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { messageId } = await params
    const message = await ContactService.getById(messageId)
    
    if (!message) {
      return NextResponse.json({ detail: 'İleti bulunamadı' }, { status: 404 })
    }
    
    // Mark as read if new
    if (message.status === 'new') {
      await ContactService.updateStatus(messageId, 'read')
    }
    
    return NextResponse.json({
      ...message,
      created_at: message.created_at?.toISOString() || null,
      read_at: message.read_at?.toISOString() || null,
      replied_at: message.replied_at?.toISOString() || null
    })
  } catch (error) {
    console.error('Get contact message error:', error)
    return NextResponse.json({ detail: 'İleti alınırken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const authResult = await requireOpsRoles(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { messageId } = await params
    
    const deleted = await ContactService.delete(messageId)
    
    if (!deleted) {
      return NextResponse.json({ detail: 'İleti bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'İleti silindi' })
  } catch (error) {
    console.error('Delete contact message error:', error)
    return NextResponse.json({ detail: 'İleti silinirken hata oluştu' }, { status: 500 })
  }
}
