import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireOpsRoles } from '@/lib/middleware/auth'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import { AppointmentService } from '@/lib/services/appointment-service'
import { TestimonialService } from '@/lib/services/testimonial-service'
import { ContactService } from '@/lib/services/contact-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireOpsRoles(request)
    if (authResult instanceof NextResponse) return authResult
    
    // Get various stats
    const [crmStats, testimonialAnalytics, contactStats] = await Promise.all([
      AppointmentService.getStats(),
      TestimonialService.getAnalytics(),
      ContactService.getStats()
    ])
    
    // Get entity counts
    const servicesCollection = await getCollection(COLLECTIONS.SERVICES)
    const teamCollection = await getCollection(COLLECTIONS.TEAM_MEMBERS)
    const blogCollection = await getCollection(COLLECTIONS.BLOG_POSTS)
    const galleryCollection = await getCollection(COLLECTIONS.GALLERY_ALBUMS)
    
    const [servicesCount, teamCount, blogCount, galleryCount] = await Promise.all([
      servicesCollection.countDocuments({ archived_at: null, status: 'published' }),
      teamCollection.countDocuments({ archived_at: null, status: 'published' }),
      blogCollection.countDocuments({ archived_at: null, status: 'published' }),
      galleryCollection.countDocuments({ status: 'published' })
    ])
    
    return NextResponse.json({
      overview: {
        services_count: servicesCount,
        team_count: teamCount,
        blog_posts_count: blogCount,
        gallery_albums_count: galleryCount
      },
      crm: crmStats,
      testimonials: testimonialAnalytics,
      contact: contactStats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json({ detail: 'Dashboard verileri alınırken hata oluştu' }, { status: 500 })
  }
}
