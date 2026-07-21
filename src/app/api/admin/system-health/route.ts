import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'

interface HealthIssue {
  severity: 'warning' | 'error'
  message: string
  href: string
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult

    const issues: HealthIssue[] = []

    const [services, slides, settings, blogPosts, teamMembers] = await Promise.all([
      (await getCollection(COLLECTIONS.SERVICES)).find({ status: 'published' }, { projection: { _id: 0, title: 1, cover_image_url: 1, seo: 1 } }).toArray(),
      (await getCollection(COLLECTIONS.SLIDES)).find({}, { projection: { _id: 0, is_active: 1 } }).toArray(),
      (await getCollection(COLLECTIONS.SETTINGS)).findOne({}, { projection: { _id: 0, phone: 1, whatsapp: 1, address: 1, email: 1 } }),
      (await getCollection(COLLECTIONS.BLOG_POSTS)).find({ status: 'published' }, { projection: { _id: 0, title: 1, slug: 1, cover_image_url: 1 } }).toArray(),
      (await getCollection(COLLECTIONS.TEAM_MEMBERS)).find({ status: 'published' }, { projection: { _id: 0, full_name: 1, photo_url: 1 } }).toArray(),
    ])

    const noImageServices = services.filter((s: any) => !s.cover_image_url)
    if (noImageServices.length > 0) {
      issues.push({ severity: 'warning', message: `${noImageServices.length} yayındaki hizmetin kapak görseli eksik (${noImageServices.slice(0, 2).map((s: any) => s.title).join(', ')}${noImageServices.length > 2 ? '…' : ''})`, href: '/admin/services' })
    }

    const noSeoServices = services.filter((s: any) => !s.seo?.meta_title && !s.seo?.meta_description)
    if (noSeoServices.length > 0) {
      issues.push({ severity: 'warning', message: `${noSeoServices.length} yayındaki hizmetin SEO başlığı/açıklaması eksik`, href: '/admin/services' })
    }

    if (!slides.some((s: any) => s.is_active)) {
      issues.push({ severity: 'error', message: 'Ana sayfada yayında olan slider yok — hero alanı boş görünebilir', href: '/admin/slider' })
    }

    if (!settings?.phone) issues.push({ severity: 'error', message: 'Site ayarlarında telefon numarası eksik', href: '/admin/settings' })
    if (!settings?.whatsapp) issues.push({ severity: 'error', message: 'Site ayarlarında WhatsApp numarası eksik', href: '/admin/settings' })
    if (!settings?.address) issues.push({ severity: 'warning', message: 'Site ayarlarında adres eksik', href: '/admin/settings' })

    const noSlugPosts = blogPosts.filter((p: any) => !p.slug)
    if (noSlugPosts.length > 0) {
      issues.push({ severity: 'error', message: `${noSlugPosts.length} yayındaki blog yazısının adresi (slug) eksik`, href: '/admin/blog' })
    }
    const noCoverPosts = blogPosts.filter((p: any) => !p.cover_image_url)
    if (noCoverPosts.length > 0) {
      issues.push({ severity: 'warning', message: `${noCoverPosts.length} yayındaki blog yazısının kapak görseli eksik`, href: '/admin/blog' })
    }

    const noPhotoMembers = teamMembers.filter((m: any) => !m.photo_url)
    if (noPhotoMembers.length > 0) {
      issues.push({ severity: 'warning', message: `${noPhotoMembers.length} yayındaki ekip üyesinin fotoğrafı eksik`, href: '/admin/team' })
    }

    return NextResponse.json({ healthy: issues.length === 0, issues })
  } catch (error) {
    console.error('System health error:', error)
    return NextResponse.json({ detail: 'Sistem sağlığı kontrolünde hata oluştu' }, { status: 500 })
  }
}
