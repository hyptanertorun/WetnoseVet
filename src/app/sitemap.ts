import { MetadataRoute } from 'next'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetnose.com.tr'

export const dynamic = 'force-dynamic'

async function getPublishedBlogPosts(): Promise<{ slug: string; published_at: string | null; updated_at: string | null }[]> {
  try {
    const collection = await getCollection(COLLECTIONS.BLOG_POSTS)
    const posts = await collection
      .find({ status: 'published' }, { projection: { slug: 1, published_at: 1, updated_at: 1 } })
      .toArray()
    return posts as any[]
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/hizmetler`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/ekibimiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/hakkimizda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/randevu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/galeri`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/iletisim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/saglik-rehberi`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const posts = await getPublishedBlogPosts()
  const blogPages: MetadataRoute.Sitemap = posts
    .filter(p => p.slug)
    .map((post) => ({
      url: `${BASE_URL}/saglik-rehberi/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.published_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...staticPages, ...blogPages]
}
