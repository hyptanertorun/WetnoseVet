import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { ClinicRhythmService } from '@/lib/services/clinic-rhythm-service'

export async function GET() {
  try {
    const entry = await ClinicRhythmService.getLatestPublished()
    
    if (!entry) {
      return NextResponse.json({
        date_key: '',
        featured_question: null,
        false_alarm: null
      })
    }
    
    return NextResponse.json({
      date_key: entry.date_key,
      featured_question: entry.featured_question,
      false_alarm: entry.false_alarm
    })
  } catch (error) {
    console.error('Get clinic rhythm latest error:', error)
    return NextResponse.json(
      { detail: 'Klinik ritmi alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
