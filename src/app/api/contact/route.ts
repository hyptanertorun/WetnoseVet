import { NextRequest, NextResponse } from 'next/server'
import { ContactService } from '@/lib/services/contact-service'
import { checkPublicFormRateLimit, rateLimitResponse } from '@/lib/middleware/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = checkPublicFormRateLimit(request)
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.retryAfterSeconds!)
    }
    
    const body = await request.json()
    const { name, email, phone, subject, message, honeypot } = body
    
    // Honeypot check
    if (honeypot) {
      console.warn('Honeypot triggered from IP:', request.headers.get('x-forwarded-for'))
      return NextResponse.json({ success: true, message: 'Mesajınız alındı!' })
    }
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { detail: 'İsim, e-posta, konu ve mesaj gerekli' },
        { status: 400 }
      )
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { detail: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }
    
    const contactMessage = await ContactService.create({
      name,
      email,
      phone,
      subject,
      message
    })
    
    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.',
      id: contactMessage.id
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { detail: 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
