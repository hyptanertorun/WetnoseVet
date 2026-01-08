import { NextRequest, NextResponse } from 'next/server'
import { TestimonialService } from '@/lib/services/testimonial-service'
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
    const { 
      full_name, 
      email, 
      phone, 
      pet_name, 
      pet_photo_url, 
      service_id, 
      rating, 
      feedback_type, 
      comment, 
      consent_internal, 
      consent_public,
      honeypot 
    } = body
    
    // Honeypot check
    if (honeypot) {
      console.warn('Honeypot triggered from IP:', request.headers.get('x-forwarded-for'))
      // Return success to not alert the bot
      return NextResponse.json({
        success: true,
        message: 'Geri bildiriminiz için teşekkürler!'
      })
    }
    
    if (!full_name || !pet_name || !rating || !comment || !consent_internal) {
      return NextResponse.json(
        { detail: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }
    
    const testimonial = await TestimonialService.submitPublicFeedback({
      full_name,
      email,
      phone,
      pet_name,
      pet_photo_url,
      service_id,
      rating,
      feedback_type,
      comment,
      consent_internal,
      consent_public: consent_public || false
    })
    
    // Mark appointment as feedback received if phone provided
    if (phone) {
      await AppointmentService.checkFeedbackReceivedByPhone(phone)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Geri bildiriminiz için teşekkürler! Değerlendirmeniz bizim için çok değerli.',
      id: testimonial.id
    })
  } catch (error) {
    console.error('Submit feedback error:', error)
    return NextResponse.json(
      { detail: 'Geri bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
