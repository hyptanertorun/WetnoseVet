// User Types
export type UserRole = 'admin' | 'manager' | 'reception' | 'editor'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string
  role: UserRole
  status: UserStatus
  phone?: string | null
  avatar_url?: string | null
  last_login?: Date | null
  created_at: Date
  updated_at: Date
  created_by?: string | null
  must_change_password: boolean
  is_support_admin?: boolean
}

export interface RefreshToken {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
  revoked: boolean
}

// Service Types
export type ServiceStatus = 'draft' | 'published' | 'archived'
export type PriceMode = 'contact' | 'fixed' | 'from'

export interface ServiceSEO {
  meta_title?: string | null
  meta_description?: string | null
  og_image_url?: string | null
}

export interface Service {
  id: string
  title: string
  slug: string
  short_description: string
  long_description?: string | null
  cover_image_url: string
  cover_image_alt?: string | null
  icon?: string | null
  price_mode: PriceMode
  price_value?: number | null
  tags: string[]
  category?: string | null
  seo: ServiceSEO
  status: ServiceStatus
  sort_order: number
  archived_at?: Date | null
  created_at: Date
  updated_at: Date
  created_by?: string | null
  updated_by?: string | null
}

// Team Member Types
export interface SocialLinks {
  instagram?: string
  linkedin?: string
  twitter?: string
  facebook?: string
}

export interface TeamMember {
  id: string
  full_name: string
  slug: string
  role_title: string
  department?: string | null
  specialties: string[]
  bio?: string | null
  short_bio?: string | null
  photo_url: string
  photo_alt?: string | null
  photo_thumbnail?: string | null
  email?: string | null
  phone?: string | null
  social_links: SocialLinks
  experience?: string | null
  experience_years?: number | null
  quote?: string | null
  education: string[]
  certifications: string[]
  working_schedule?: string | null
  accepts_appointments: boolean
  is_owner: boolean
  is_featured: boolean
  show_contact_info: boolean
  status: ServiceStatus
  sort_order: number
  archived_at?: Date | null
  created_at: Date
  updated_at: Date
}

// Blog Types
export interface BlogSEO {
  meta_title?: string | null
  meta_description?: string | null
  og_image?: string | null
}

export interface FAQItem {
  question: string
  answer: string
}

export interface CTABlock {
  type: string
  text: string
}

export interface AIMetadata {
  faq?: FAQItem[] | null
  schema_jsonld?: string | null
  cta_block?: CTABlock | null
  disclaimer?: string | null
  outline?: string[] | null
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  cover_image_url?: string | null
  cover_image_alt?: string | null
  content?: string | null
  category?: string | null
  tags: string[]
  seo?: BlogSEO | null
  status: ServiceStatus
  published_at?: Date | null
  ai_generated: boolean
  ai_metadata?: AIMetadata | null
  view_count: number
  archived_at?: Date | null
  created_at: Date
  updated_at: Date
  created_by?: string | null
  updated_by?: string | null
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  icon?: string | null
  sort_order: number
  is_active: boolean
  post_count: number
  created_at: Date
  updated_at: Date
}

// Gallery Types
export interface GalleryAlbum {
  id: string
  title: string
  slug: string
  description?: string | null
  cover_image_url?: string | null
  status: ServiceStatus
  sort_order: number
  created_at: Date
  updated_at: Date
}

export interface GalleryItem {
  id: string
  album_id: string
  image_url: string
  image_alt?: string | null
  caption?: string | null
  sort_order: number
  created_at: Date
}

// Testimonial Types
export type TestimonialStatus = 'pending' | 'approved' | 'rejected' | 'archived'
export type FeedbackType = 'positive' | 'neutral' | 'negative'

export interface Testimonial {
  id: string
  full_name: string
  email?: string | null
  phone?: string | null
  pet_name: string
  pet_type?: string | null
  pet_photo_url?: string | null
  owner_photo_url?: string | null
  service_id?: string | null
  service_name_snapshot?: string | null
  treatment?: string | null
  rating: number
  feedback_type: FeedbackType
  comment: string
  consent_internal: boolean
  consent_public: boolean
  status: TestimonialStatus
  admin_note?: string | null
  submitted_at: Date
  approved_at?: Date | null
  approved_by?: string | null
  approved_by_email?: string | null
  source: string
  archived_at?: Date | null
  sort_order: number
}

// Settings Types
export interface WorkingHour {
  day: string
  open_time: string
  close_time: string
  is_closed: boolean
}

export interface Settings {
  id: string
  clinic_name: string
  phone: string
  whatsapp: string
  emergency_phone?: string | null
  email: string
  address: string
  city: string
  district: string
  maps_embed_url?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  twitter_url?: string | null
  youtube_url?: string | null
  pinterest_url?: string | null
  tiktok_url?: string | null
  working_hours: WorkingHour[]
  is_24_7_emergency: boolean
  kvkk_text?: string | null
  maintenance_mode: boolean
  maintenance_message?: string | null
  maintenance_end_date?: Date | null
  updated_at: Date
  updated_by?: string | null
}

// Appointment Types
export type AppointmentStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type LeadHeat = 'hot' | 'warm' | 'cold'

export interface AppointmentNote {
  id: string
  content: string
  created_by: string
  created_by_email: string
  created_at: Date
}

export interface LeadScoreReason {
  factor: string
  points: number
  description: string
}

export interface Appointment {
  id: string
  name: string
  phone: string
  email?: string | null
  pet_name?: string | null
  pet_type?: string | null
  pet_breed?: string | null
  service_requested?: string | null
  preferred_date?: string | null
  preferred_time?: string | null
  message?: string | null
  source: string
  status: AppointmentStatus
  assigned_to?: string | null
  assigned_to_email?: string | null
  follow_up_at?: Date | null
  notes: AppointmentNote[]
  lead_score: number
  lead_heat: LeadHeat
  lead_score_reasons: LeadScoreReason[]
  created_at: Date
  updated_at: Date
  contacted_at?: Date | null
  scheduled_at?: Date | null
  completed_at?: Date | null
  feedback_sent?: boolean
  feedback_received?: boolean
}

// Slider Types
export type ButtonStyle = 'primary' | 'secondary' | 'outline' | 'ghost'

export interface SlideButton {
  id: string
  text: string
  href: string
  style: ButtonStyle
  icon?: string | null
  is_visible: boolean
}

export interface SlideOverlay {
  enabled: boolean
  opacity: number
  gradient_direction: string
  color: string
}

export interface Slide {
  id: string
  title: string
  subtitle?: string | null
  image_url: string
  image_alt?: string | null
  mobile_image_url?: string | null
  buttons: SlideButton[]
  overlay: SlideOverlay
  is_active: boolean
  sort_order: number
  animation_duration: number
  created_at: Date
  updated_at: Date
}

export interface SliderBadge {
  enabled: boolean
  text: string
  icon: string
}

export interface SliderStats {
  enabled: boolean
  items: Array<{ icon: string; value: string; label: string }>
}

export interface SliderSettings {
  id: string
  auto_play: boolean
  auto_play_interval: number
  show_navigation_arrows: boolean
  show_navigation_dots: boolean
  show_progress_bar: boolean
  show_slide_counter: boolean
  show_scroll_indicator: boolean
  badge: SliderBadge
  stats: SliderStats
  ken_burns_effect: boolean
  scan_line_effect: boolean
  updated_at: Date
}

// Clinic Rhythm Types
export interface FeaturedQuestion {
  question_text: string
  short_answer: string
  related_blog_slug?: string | null
  related_blog_title?: string | null
}

export interface FalseAlarm {
  message_title: string
  message_body: string
  supportive_line: string
}

export interface ClinicRhythm {
  id: string
  date_key: string
  featured_question?: FeaturedQuestion | null
  false_alarm?: FalseAlarm | null
  status: ServiceStatus
  created_at: Date
  updated_at: Date
  created_by?: string | null
}

export interface PoolQuestion {
  id: string
  question_text: string
  short_answer: string
  related_blog_slug?: string | null
  related_blog_title?: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface PoolAlarm {
  id: string
  message_title: string
  message_body: string
  supportive_line: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Audit Log Types
export type AuditAction = 
  | 'create' | 'update' | 'delete' | 'restore' | 'archive'
  | 'login' | 'logout' | 'login_failed' | 'token_refresh' | 'password_change'
  | 'status_change' | 'reorder' | 'bulk_action' | 'export' | 'import'
  | 'ai_generate' | 'ai_revise'

export interface AuditLog {
  id: string
  actor_user_id?: string | null
  actor_email?: string | null
  actor_role?: string | null
  entity_type: string
  entity_id?: string | null
  action: AuditAction
  before_state?: Record<string, unknown> | null
  after_state?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  ip_address?: string | null
  user_agent?: string | null
  timestamp: Date
  success: boolean
  error_message?: string | null
}

// Version Types
export interface Version {
  id: string
  entity_type: string
  entity_id: string
  version_no: number
  snapshot: Record<string, unknown>
  change_reason?: string | null
  created_at: Date
  created_by: string
  created_by_email: string
}

// Contact Message Types
export type ContactStatus = 'new' | 'read' | 'replied' | 'archived'

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  status: ContactStatus
  created_at: Date
  read_at?: Date | null
  replied_at?: Date | null
}
