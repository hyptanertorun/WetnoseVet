import { NextRequest, NextResponse } from 'next/server'
import { TeamService } from '@/lib/services/team-service'

export async function GET(request: NextRequest) {
  try {
    const members = await TeamService.getPublished()
    
    return NextResponse.json({
      team_members: members.map(m => ({
        id: m.id,
        full_name: m.full_name,
        role_title: m.role_title,
        photo_url: m.photo_url,
        bio: m.bio,
        specialties: m.specialties || [],
        social_links: m.social_links || {},
        sort_order: m.sort_order
      })),
      total: members.length
    })
  } catch (error) {
    console.error('Get public team error:', error)
    return NextResponse.json(
      { detail: 'Ekip bilgileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
