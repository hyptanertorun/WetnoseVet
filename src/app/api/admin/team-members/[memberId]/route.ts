import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { TeamService } from '@/lib/services/team-service'
import { AuditService } from '@/lib/services/audit-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const { memberId } = await params
    const member = await TeamService.getById(memberId)
    
    if (!member) {
      return NextResponse.json({ detail: 'Ekip üyesi bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(member)
  } catch (error) {
    console.error('Get team member error:', error)
    return NextResponse.json({ detail: 'Ekip üyesi alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { memberId } = await params
    const body = await request.json()
    
    const beforeMember = await TeamService.getById(memberId)
    if (!beforeMember) {
      return NextResponse.json({ detail: 'Ekip üyesi bulunamadı' }, { status: 404 })
    }
    
    const updatedMember = await TeamService.update(memberId, body)
    
    await AuditService.log({
      entityType: 'team_member',
      entityId: memberId,
      action: 'update',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      beforeState: { full_name: beforeMember.full_name, status: beforeMember.status },
      afterState: body,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Update team member error:', error)
    return NextResponse.json({ detail: 'Ekip üyesi güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const { memberId } = await params
    
    const member = await TeamService.getById(memberId)
    if (!member) {
      return NextResponse.json({ detail: 'Ekip üyesi bulunamadı' }, { status: 404 })
    }
    
    await TeamService.archive(memberId)
    
    await AuditService.log({
      entityType: 'team_member',
      entityId: memberId,
      action: 'archive',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      metadata: { full_name: member.full_name },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({ message: 'Ekip üyesi arşivlendi' })
  } catch (error) {
    console.error('Delete team member error:', error)
    return NextResponse.json({ detail: 'Ekip üyesi silinirken hata oluştu' }, { status: 500 })
  }
}
