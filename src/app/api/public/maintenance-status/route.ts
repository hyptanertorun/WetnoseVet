import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { SettingsService } from '@/lib/services/settings-service'

export async function GET() {
  try {
    const status = await SettingsService.getMaintenanceStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Get maintenance status error:', error)
    return NextResponse.json(
      { detail: 'Bakım durumu alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
