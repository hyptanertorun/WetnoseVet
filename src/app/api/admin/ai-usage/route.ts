import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    // Check configuration status
    const openaiKey = process.env.OPENAI_API_KEY || process.env.EMERGENT_LLM_KEY
    
    return NextResponse.json({
      ai_enabled: !!openaiKey,
      features: {
        blog_generation: !!openaiKey,
        image_generation: !!openaiKey
      },
      usage: {
        total_generations: 0,
        this_month: 0,
        remaining_credits: openaiKey ? 'unlimited' : 0
      }
    })
  } catch (error) {
    console.error('AI usage error:', error)
    return NextResponse.json({ detail: 'AI kullanım bilgileri alınırken hata oluştu' }, { status: 500 })
  }
}
