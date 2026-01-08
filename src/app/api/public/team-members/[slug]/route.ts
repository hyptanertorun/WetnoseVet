import { NextRequest, NextResponse } from 'next/server'
import { TeamService } from '@/lib/services/team-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const member = await TeamService.getPublishedBySlug(slug)
    
    if (!member) {
      return NextResponse.json(
        { detail: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: member.id,
      full_name: member.full_name,
      slug: member.slug,
      role_title: member.role_title,
      department: member.department,
      specialties: member.specialties,
      bio: member.bio,
      short_bio: member.short_bio,
      photo_url: member.photo_url,
      photo_alt: member.photo_alt,
      photo_thumbnail: member.photo_thumbnail,
      email: member.show_contact_info ? member.email : null,
      phone: member.show_contact_info ? member.phone : null,
      social_links: member.social_links,
      experience: member.experience,
      experience_years: member.experience_years,
      quote: member.quote,
      education: member.education,
      certifications: member.certifications,
      working_schedule: member.working_schedule,
      accepts_appointments: member.accepts_appointments,
      is_owner: member.is_owner,
      is_featured: member.is_featured,
      show_contact_info: member.show_contact_info
    })
  } catch (error) {
    console.error('Get public team member error:', error)
    return NextResponse.json(
      { detail: 'Ekip üyesi alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
