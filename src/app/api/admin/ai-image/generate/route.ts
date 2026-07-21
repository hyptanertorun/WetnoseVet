// AI Image Generation - OPTIONAL FEATURE
export const dynamic = 'force-dynamic'
// Returns disabled response if API keys are not configured

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    // Check if AI is configured
    const openaiKey = process.env.OPENAI_API_KEY || process.env.EMERGENT_LLM_KEY
    
    if (!openaiKey) {
      return NextResponse.json({
        success: false,
        error: 'ai_not_configured',
        message: 'AI görsel üretimi henüz yapılandırılmamış. Lütfen OPENAI_API_KEY veya EMERGENT_LLM_KEY ortam değişkenini ayarlayın.'
      }, { status: 503 })
    }
    
    // AI generation is available but not implemented in this MVP
    return NextResponse.json({
      success: false,
      error: 'ai_feature_pending',
      message: 'AI görsel üretimi şu anda geliştirilme aşamasında. Lütfen daha sonra tekrar deneyin.'
    }, { status: 501 })
  } catch (error) {
    console.error('AI image generation error:', error)
    return NextResponse.json({ detail: 'AI görsel üretimi sırasında hata oluştu' }, { status: 500 })
  }
}
