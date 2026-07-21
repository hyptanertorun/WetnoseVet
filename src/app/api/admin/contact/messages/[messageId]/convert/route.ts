import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireOpsRoles, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { ContactService } from '@/lib/services/contact-service'
import { AppointmentService } from '@/lib/services/appointment-service'
import { AuditService } from '@/lib/services/audit-service'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { Appointment, ContactMessage } from '@/lib/models/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const authResult = await requireOpsRoles(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { messageId } = await params
    const message = await ContactService.getById(messageId)
    if (!message) {
      return NextResponse.json({ detail: 'Mesaj bulunamadı' }, { status: 404 })
    }

    if (message.status === 'converted') {
      return NextResponse.json(
        { detail: 'Bu mesaj zaten randevu talebine dönüştürülmüş', appointment_id: message.converted_appointment_id },
        { status: 409 }
      )
    }

    let force = false
    try {
      const body = await request.json()
      force = body?.force === true
    } catch { /* empty body is fine */ }

    // Duplicate customer check (same phone or email)
    const appointmentsCollection = await getCollection<Appointment>(COLLECTIONS.APPOINTMENTS)
    const dupConditions: Record<string, unknown>[] = []
    if (message.phone) dupConditions.push({ phone: message.phone })
    if (message.email) dupConditions.push({ email: message.email })
    const duplicates = dupConditions.length > 0
      ? await appointmentsCollection
          .find({ $or: dupConditions }, { projection: { _id: 0, id: 1, name: 1, phone: 1, status: 1, created_at: 1 } })
          .sort({ created_at: -1 })
          .limit(5)
          .toArray()
      : []

    if (duplicates.length > 0 && !force) {
      return NextResponse.json({
        requires_confirmation: true,
        detail: 'Aynı telefon veya e-posta ile kayıtlı randevu talebi bulundu. Yine de dönüştürmek istiyor musunuz?',
        duplicates
      })
    }

    // Create appointment from message (data carried over automatically)
    const appointment = await AppointmentService.create({
      name: message.name,
      phone: message.phone || '',
      email: message.email || undefined,
      message: `[İletişim Mesajı: ${message.subject}]\n${message.message}`,
      source: 'contact_message'
    })

    // Keep source relation on both sides
    await appointmentsCollection.updateOne(
      { id: appointment.id },
      { $set: { source_message_id: message.id } }
    )

    const messagesCollection = await getCollection<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES)
    await messagesCollection.updateOne(
      { id: message.id },
      { $set: { status: 'converted', converted_appointment_id: appointment.id, converted_at: new Date() } }
    )

    await AuditService.log({
      entityType: 'appointment',
      entityId: appointment.id,
      action: 'create',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      metadata: { converted_from_message: message.id, message_subject: message.subject }
    })

    return NextResponse.json({
      message: 'Mesaj randevu talebine dönüştürüldü',
      appointment_id: appointment.id
    })
  } catch (error) {
    console.error('Convert message error:', error)
    return NextResponse.json({ detail: 'Dönüştürme sırasında hata oluştu' }, { status: 500 })
  }
}
