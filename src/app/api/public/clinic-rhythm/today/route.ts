import { NextRequest, NextResponse } from 'next/server'
import { ClinicRhythmService, PoolService } from '@/lib/services/clinic-rhythm-service'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get pool content for fallback
    const poolContent = await PoolService.getPoolContentForDate(today)
    
    // Try to get manually published content
    const entry = await ClinicRhythmService.getTodayPublished()
    
    if (entry) {
      let featuredQ = null
      let falseA = null
      
      // Use manual featured question if complete
      if (entry.featured_question?.question_text && entry.featured_question?.short_answer) {
        featuredQ = entry.featured_question
      } else {
        featuredQ = poolContent.featured_question
      }
      
      // Use manual false alarm if complete
      if (entry.false_alarm?.message_title && entry.false_alarm?.message_body && entry.false_alarm?.supportive_line) {
        falseA = entry.false_alarm
      } else {
        falseA = poolContent.false_alarm
      }
      
      return NextResponse.json({
        date_key: entry.date_key,
        featured_question: featuredQ,
        false_alarm: falseA
      })
    }
    
    // No manual content - use pool fallback
    return NextResponse.json({
      date_key: today,
      featured_question: poolContent.featured_question,
      false_alarm: poolContent.false_alarm
    })
  } catch (error) {
    console.error('Get clinic rhythm today error:', error)
    return NextResponse.json(
      { detail: 'Klinik ritmi alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
