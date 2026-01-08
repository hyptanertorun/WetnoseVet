import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { ContactService } from '@/lib/services/contact-service'
import type { ContactStatus } from '@/lib/models/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { messageId } = await params
    const body = await request.json()
    const { status } = body as { status: ContactStatus }
    
    if (!status) {
      return NextResponse.json({ detail: 'Status gerekli' }, { status: 400 })
    }
    
    const message = await ContactService.updateStatus(messageId, status)
    
    if (!message) {
      return NextResponse.json({ detail: 'İleti bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(message)
  } catch (error) {
    console.error('Update contact status error:', error)
    return NextResponse.json({ detail: 'Status güncellenirken hata oluştu' }, { status: 500 })
  }
}
