// Public API Client for fetching content
// Used by public pages (hizmetler, ekibimiz)

interface Service {
  id: string
  title: string
  slug: string
  short_description: string
  long_description: string | null
  cover_image_url: string
  cover_image_alt: string | null
  image_url?: string | null
  icon: string | null
  price_mode: string
  price_value: number | null
  tags: string[]
  category: string | null
  seo: {
    meta_title: string | null
    meta_description: string | null
    og_image_url: string | null
  }
}

interface TeamMember {
  id: string
  full_name: string
  slug: string
  role_title: string
  specialties: string[]
  bio: string | null
  photo_url: string
  photo_alt: string | null
  social_links: {
    instagram?: string
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  experience: string | null
  quote: string | null
  is_owner: boolean
}

// Blog / Sağlık Rehberi Types
interface FAQItem {
  question: string
  answer: string
}

interface CTABlock {
  type: string
  text: string
}

interface AIMetadata {
  faq: FAQItem[] | null
  schema_jsonld: string | null
  cta_block: CTABlock | null
  disclaimer: string | null
  outline: string[] | null
}

interface BlogSEO {
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
}

// Lightweight type for list view - no content field
interface BlogPostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  category: string | null
  tags: string[]
  published_at: string | null
  reading_time: number | null
}

// Full type for detail view
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  content: string | null
  category: string | null
  tags: string[]
  seo: BlogSEO | null
  published_at: string | null
  ai_generated: boolean
  ai_metadata: AIMetadata | null
  reading_time: number | null
}

function getApiUrl(): string {
  // Server-side: use internal backend URL
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
  }
  // Client-side: use public backend URL or same origin
  return process.env.NEXT_PUBLIC_BACKEND_URL || ''
}

export async function getPublicServices(): Promise<Service[]> {
  try {
    const response = await fetch(`${getApiUrl()}/api/public/services`)
    if (!response.ok) {
      console.error('Failed to fetch services')
      return []
    }
    const data = await response.json()
    return data.services || []
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function getPublicServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const response = await fetch(`${getApiUrl()}/api/public/services/${slug}`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export async function getPublicTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch(`${getApiUrl()}/api/public/team-members`)
    if (!response.ok) {
      console.error('Failed to fetch team members')
      return []
    }
    const data = await response.json()
    return data.team_members || []
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}

export async function getPublicTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  try {
    const response = await fetch(`${getApiUrl()}/api/public/team-members/${slug}`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching team member:', error)
    return null
  }
}

// Blog / Sağlık Rehberi API Functions with Cache
export async function getPublicBlogPosts(): Promise<BlogPostListItem[]> {
  try {
    const response = await fetch(`${getApiUrl()}/api/public/blog`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    if (!response.ok) {
      console.error('Failed to fetch blog posts')
      return []
    }
    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export async function getPublicBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${getApiUrl()}/api/public/blog/${slug}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export type { Service, TeamMember, BlogPost, BlogPostListItem, FAQItem, AIMetadata, BlogSEO }
