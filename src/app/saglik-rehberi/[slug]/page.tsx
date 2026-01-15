import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BlogPostClient from './BlogPostClient'

// For server-side fetching, we need to use internal URL since Next.js runs on same server
const API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3000'
const BASE_URL = 'https://www.wetnose.com.tr'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

// Fetch blog post data - Server side
async function getBlogPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/public/blog/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })
    
    if (!res.ok) {
      return null
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: 'Sayfa Bulunamadı | Wetnose Veteriner',
      robots: { index: false, follow: false }
    }
  }
  
  const title = post.seo?.meta_title || post.title
  const description = post.seo?.meta_description || post.excerpt || ''
  const imageUrl = post.cover_image_url || `${BASE_URL}/og-default.jpg`
  
  return {
    title: `${title} | Wetnose Veteriner`,
    description,
    keywords: post.seo?.keywords?.join(', ') || post.tags?.join(', '),
    authors: [{ name: 'Wetnose Veteriner Kliniği' }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      url: `${BASE_URL}/saglik-rehberi/${slug}`,
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
      canonical: `${BASE_URL}/saglik-rehberi/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Main page component - Server Component
export default async function SaglikRehberiDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  // Return 404 if post not found or not published
  if (!post) {
    notFound()
  }
  
  // Check if post is published (status check)
  if (post.status && post.status !== 'published') {
    notFound()
  }
  
  // Check for thin content (optional - noindex if content is too short)
  const contentLength = post.content?.replace(/<[^>]*>/g, '').length || 0
  const isThinContent = contentLength < 100
  
  return <BlogPostClient post={post} isThinContent={isThinContent} />
}
