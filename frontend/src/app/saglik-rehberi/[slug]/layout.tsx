import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetnose.com.tr'
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

interface BlogPost {
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  seo?: {
    meta_title?: string | null
    meta_description?: string | null
    og_image?: string | null
  } | null
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${API_URL}/api/public/blog/${slug}`, {
      next: { revalidate: 3600 }
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return {
      title: 'Sayfa Bulunamadı | Wetnose',
      description: 'Aradığınız sayfa bulunamadı.',
    }
  }
  
  const title = post.seo?.meta_title || `${post.title} | Wetnose Sağlık Rehberi`
  const description = post.seo?.meta_description || post.excerpt || 'Evcil hayvan sağlığı hakkında güvenilir bilgiler.'
  const ogImage = post.seo?.og_image || post.cover_image_url || `${BASE_URL}/og-default.jpg`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'tr_TR',
      url: `${BASE_URL}/saglik-rehberi/${post.slug}`,
      siteName: 'Wetnose Veteriner Kliniği',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE_URL}/saglik-rehberi/${post.slug}`,
    },
  }
}

export default function BlogDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
