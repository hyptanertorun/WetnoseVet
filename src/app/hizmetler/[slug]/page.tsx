import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import HizmetDetailClient from './HizmetDetailClient'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
const BASE_URL = 'https://www.wetnose.com.tr'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

// Fetch service data - Server side
async function getService(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/public/services/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })
    
    if (!res.ok) {
      return null
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Failed to fetch service:', error)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  
  if (!service) {
    return {
      title: 'Sayfa Bulunamadı | Wetnose Veteriner',
      robots: { index: false, follow: false }
    }
  }
  
  const title = service.seo?.meta_title || service.title
  const description = service.seo?.meta_description || service.short_description || ''
  const imageUrl = service.cover_image_url || `${BASE_URL}/og-default.jpg`
  
  return {
    title: `${title} | Wetnose Veteriner`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/hizmetler/${slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      siteName: 'Wetnose Veteriner Kliniği',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${BASE_URL}/hizmetler/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Main page component - Server Component
export default async function HizmetDetailPage({ params }: PageProps) {
  const { slug } = await params
  const service = await getService(slug)
  
  // Return 404 if service not found
  if (!service) {
    notFound()
  }
  
  return <HizmetDetailClient service={service} />
}
