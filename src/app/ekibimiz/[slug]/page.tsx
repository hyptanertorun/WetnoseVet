import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import TeamMemberDetailClient from './TeamMemberDetailClient'

// For server-side fetching, we need to use internal URL since Next.js runs on same server
const API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3000'
const BASE_URL = 'https://www.wetnose.com.tr'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

// Fetch team member data - Server side
async function getTeamMember(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/public/team/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })
    
    if (!res.ok) {
      return null
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Failed to fetch team member:', error)
    return null
  }
}

// Fetch other team members for sidebar
async function getOtherTeamMembers(excludeSlug: string) {
  try {
    const res = await fetch(`${API_URL}/api/public/team`, {
      next: { revalidate: 60 },
    })
    
    if (!res.ok) {
      return []
    }
    
    const data = await res.json()
    const allMembers = data || []
    return allMembers.filter((m: any) => m.slug !== excludeSlug).slice(0, 3)
  } catch (error) {
    console.error('Failed to fetch other team members:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const member = await getTeamMember(slug)
  
  if (!member) {
    return {
      title: 'Sayfa Bulunamadı | Wetnose Veteriner',
      robots: { index: false, follow: false }
    }
  }
  
  const title = member.full_name
  const description = member.bio ? member.bio.replace(/<[^>]*>/g, '').substring(0, 160) : `${member.full_name} - ${member.role_title}`
  const imageUrl = member.photo_url || `${BASE_URL}/og-default.jpg`
  
  return {
    title: `${title} | Wetnose Veteriner Ekibi`,
    description,
    openGraph: {
      title: `${title} - ${member.role_title}`,
      description,
      type: 'profile',
      url: `${BASE_URL}/ekibimiz/${slug}`,
      images: [{ url: imageUrl, width: 800, height: 800, alt: title }],
      siteName: 'Wetnose Veteriner Kliniği',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - ${member.role_title}`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${BASE_URL}/ekibimiz/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Main page component - Server Component
export default async function EkibimizDetailPage({ params }: PageProps) {
  const { slug } = await params
  
  // Fetch data in parallel
  const [member, otherMembers] = await Promise.all([
    getTeamMember(slug),
    getOtherTeamMembers(slug)
  ])
  
  // Return 404 if member not found
  if (!member) {
    notFound()
  }
  
  return <TeamMemberDetailClient member={member} otherMembers={otherMembers} />
}
