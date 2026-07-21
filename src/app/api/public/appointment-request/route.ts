import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { AppointmentService } from '@/lib/services/appointment-service'
import { checkPublicFormRateLimit, rateLimitResponse } from '@/lib/middleware/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = checkPublicFormRateLimit(request)
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.retryAfterSeconds!)
    }
    
    const body = await request.json()
    const { name, phone, email, pet_name, pet_type, pet_breed, service_requested, preferred_date, preferred_time, message } = body
    
    if (!name || !phone) {
      return NextResponse.json(
        { detail: 'İsim ve telefon gerekli' },
        { status: 400 }
      )
    }
    
    const appointment = await AppointmentService.create({
      name,
      phone,
      email,
      pet_name,
      pet_type,
      pet_breed,
      service_requested,
      preferred_date,
      preferred_time,
      message,
      source: 'website'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Randevu talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.',
      request_id: appointment.id
    })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { detail: 'Randevu talebi oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
