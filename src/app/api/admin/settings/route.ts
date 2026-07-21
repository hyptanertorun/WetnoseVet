import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminOrManager, getClientIP, getUserAgent } from '@/lib/middleware/auth'
import { SettingsService } from '@/lib/services/settings-service'
import { AuditService } from '@/lib/services/audit-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminOrManager(request)
    if (authResult instanceof NextResponse) return authResult
    
    const settings = await SettingsService.getSettings()
    
    return NextResponse.json({
      id: settings.id,
      clinic_name: settings.clinic_name,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      emergency_phone: settings.emergency_phone,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      district: settings.district,
      maps_embed_url: settings.maps_embed_url,
      facebook_url: settings.facebook_url,
      instagram_url: settings.instagram_url,
      twitter_url: settings.twitter_url,
      youtube_url: settings.youtube_url,
      pinterest_url: settings.pinterest_url,
      tiktok_url: settings.tiktok_url,
      working_hours: settings.working_hours,
      is_24_7_emergency: settings.is_24_7_emergency,
      kvkk_text: settings.kvkk_text,
      maintenance_mode: settings.maintenance_mode,
      maintenance_message: settings.maintenance_message,
      maintenance_end_date: settings.maintenance_end_date?.toISOString() || null,
      updated_at: settings.updated_at?.toISOString() || null,
      updated_by: settings.updated_by
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ detail: 'Ayarlar alınırken hata oluştu' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminOrManager(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    
    const body = await request.json()
    
    const beforeSettings = await SettingsService.getSettings()
    const updatedSettings = await SettingsService.updateSettings(body, user.id)
    
    await AuditService.log({
      entityType: 'settings',
      entityId: updatedSettings.id,
      action: 'update',
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      beforeState: { maintenance_mode: beforeSettings.maintenance_mode },
      afterState: body,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ detail: 'Ayarlar güncellenirken hata oluştu' }, { status: 500 })
  }
}
