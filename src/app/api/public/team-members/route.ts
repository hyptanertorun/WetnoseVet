import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { TeamService } from '@/lib/services/team-service'

export async function GET() {
  try {
    const members = await TeamService.getPublished()
    
    return NextResponse.json({
      team_members: members.map(m => ({
        id: m.id,
        full_name: m.full_name,
        slug: m.slug,
        role_title: m.role_title,
        department: m.department,
        specialties: m.specialties,
        bio: m.bio,
        short_bio: m.short_bio,
        photo_url: m.photo_url,
        photo_alt: m.photo_alt,
        photo_thumbnail: m.photo_thumbnail,
        email: m.show_contact_info ? m.email : null,
        phone: m.show_contact_info ? m.phone : null,
        social_links: m.social_links,
        experience: m.experience,
        experience_years: m.experience_years,
        quote: m.quote,
        education: m.education,
        certifications: m.certifications,
        working_schedule: m.working_schedule,
        accepts_appointments: m.accepts_appointments,
        is_owner: m.is_owner,
        is_featured: m.is_featured,
        show_contact_info: m.show_contact_info
      })),
      total: members.length
    })
  } catch (error) {
    console.error('Get public team members error:', error)
    return NextResponse.json(
      { detail: 'Ekip üyeleri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
