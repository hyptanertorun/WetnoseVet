import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { ClinicRhythmService, PoolService } from '@/lib/services/clinic-rhythm-service'

// Calculate which day in the 60-day cycle we're on
function getDayInCycle(dateStr: string): number {
  const startDate = new Date('2026-01-15')
  const currentDate = new Date(dateStr)
  const diffTime = currentDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  // Cycle through 60 days (0-59, then back to 0)
  return ((diffDays % 60) + 60) % 60 // Handle negative numbers too
}

// Get the date_key for the corresponding day in the cycle
function getCycleDateKey(dayInCycle: number): string {
  const startDate = new Date('2026-01-15')
  const cycleDate = new Date(startDate)
  cycleDate.setDate(cycleDate.getDate() + dayInCycle)
  return cycleDate.toISOString().split('T')[0]
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // First try to get exact date entry
    let entry = await ClinicRhythmService.getTodayPublished()
    
    // If no entry for today, use 60-day cycle fallback
    if (!entry) {
      const dayInCycle = getDayInCycle(today)
      const cycleDateKey = getCycleDateKey(dayInCycle)
      entry = await ClinicRhythmService.getByDateKey(cycleDateKey)
    }
    
    // Get pool content for fallback
    const poolContent = await PoolService.getPoolContentForDate(today)
    
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
        date_key: today, // Always show today's date to user
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
