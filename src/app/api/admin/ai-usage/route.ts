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
      total_image_generations: 0,
      total_blog_generations: 0,
      total_revisions: 0,
      last_7_days: {
        image_generations: 0,
        blog_generations: 0,
        revisions: 0
      },
      estimated_cost_usd: 0,
      features: {
        blog_generation: !!openaiKey,
        image_generation: !!openaiKey
      }
    })
  } catch (error) {
    console.error('AI usage error:', error)
    return NextResponse.json({ detail: 'AI kullanım bilgileri alınırken hata oluştu' }, { status: 500 })
  }
}
