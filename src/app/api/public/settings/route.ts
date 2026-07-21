import { NextRequest, NextResponse } from 'next/server'
import { stripId } from '@/lib/db/mongodb'
export const dynamic = 'force-dynamic'
import { SettingsService } from '@/lib/services/settings-service'

export async function GET() {
  try {
    const settings = await SettingsService.getPublicSettings()
    return NextResponse.json(stripId(settings))
  } catch (error) {
    console.error('Get public settings error:', error)
    return NextResponse.json(
      { detail: 'Ayarlar alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
