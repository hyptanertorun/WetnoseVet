import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { 
  Slide, 
  SliderSettings, 
  SlideButton, 
  SlideOverlay,
  ButtonStyle 
} from '@/lib/models/types'

const DEFAULT_SLIDER_SETTINGS: Omit<SliderSettings, 'id' | 'updated_at'> = {
  auto_play: true,
  auto_play_interval: 5000,
  show_navigation_arrows: true,
  show_navigation_dots: true,
  show_progress_bar: true,
  show_slide_counter: true,
  show_scroll_indicator: true,
  badge: {
    enabled: true,
    text: '7/24 Acil Destek',
    icon: 'phone'
  },
  stats: {
    enabled: true,
    items: [
      { icon: 'heart', value: '5000+', label: 'Mutlu Hasta' },
      { icon: 'award', value: '10+', label: 'Yıllık Deneyim' },
      { icon: 'users', value: '8+', label: 'Uzman Ekip' }
    ]
  },
  ken_burns_effect: true,
  scan_line_effect: true
}

export class SliderService {
  // Get all slides
  static async listSlides(includeInactive: boolean = true): Promise<{ slides: Slide[]; total: number }> {
    const slidesCollection = await getCollection<Slide>(COLLECTIONS.SLIDES)
    
    const filter = includeInactive ? {} : { is_active: true }
    
    const slides = await slidesCollection.find(filter).sort({ sort_order: 1 }).toArray()
    return { slides, total: slides.length }
  }
  
  // Get slide by ID
  static async getSlideById(id: string): Promise<Slide | null> {
    const slidesCollection = await getCollection<Slide>(COLLECTIONS.SLIDES)
    return slidesCollection.findOne({ id })
  }
  
  // Create slide
  static async createSlide(data: {
    title: string
    subtitle?: string
    image_url: string
    image_alt?: string
    mobile_image_url?: string
    buttons?: Array<{
      text: string
      href: string
      style?: ButtonStyle
      icon?: string
      is_visible?: boolean
    }>
    overlay?: Partial<SlideOverlay>
    is_active?: boolean
    animation_duration?: number
  }): Promise<Slide> {
    const slidesCollection = await getCollection<Slide>(COLLECTIONS.SLIDES)
    
    // Get max sort order
    const maxSort = await slidesCollection
      .find({})
      .sort({ sort_order: -1 })
      .limit(1)
      .toArray()
    const sortOrder = maxSort.length > 0 ? maxSort[0].sort_order + 1 : 0
    
    const now = new Date()
    
    const buttons: SlideButton[] = (data.buttons || []).map(b => ({
      id: uuidv4(),
      text: b.text,
      href: b.href,
      style: b.style || 'primary',
      icon: b.icon || null,
      is_visible: b.is_visible ?? true
    }))
    
    const overlay: SlideOverlay = {
      enabled: data.overlay?.enabled ?? true,
      opacity: data.overlay?.opacity ?? 0.4,
      gradient_direction: data.overlay?.gradient_direction || 'to-r',
      color: data.overlay?.color || 'from-black/60 via-black/30 to-transparent'
    }
    
    const slide: Slide = {
      id: uuidv4(),
      title: data.title,
      subtitle: data.subtitle || null,
      image_url: data.image_url,
      image_alt: data.image_alt || null,
      mobile_image_url: data.mobile_image_url || null,
      buttons,
      overlay,
      is_active: data.is_active ?? true,
      sort_order: sortOrder,
      animation_duration: data.animation_duration || 5000,
      created_at: now,
      updated_at: now
    }
    
    await slidesCollection.insertOne(slide)
    return slide
  }
  
  // Update slide
  static async updateSlide(id: string, data: Partial<Slide>): Promise<Slide | null> {
    const slidesCollection = await getCollection<Slide>(COLLECTIONS.SLIDES)
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    delete updateData.created_at
    
    await slidesCollection.updateOne(
      { id },
      { $set: updateData }
    )
    
    return this.getSlideById(id)
  }
  
  // Delete slide
  static async deleteSlide(id: string): Promise<boolean> {
    const slidesCollection = await getCollection<Slide>(COLLECTIONS.SLIDES)
    const result = await slidesCollection.deleteOne({ id })
    return result.deletedCount > 0
  }
  
  // Reorder slides
  static async reorderSlides(items: Array<{ id: string; sort_order: number }>): Promise<void> {
    const slidesCollection = await getCollection<Slide>(COLLECTIONS.SLIDES)
    
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: { sort_order: item.sort_order, updated_at: new Date() } }
      }
    }))
    
    await slidesCollection.bulkWrite(bulkOps)
  }
  
  // Get slider settings
  static async getSettings(): Promise<SliderSettings> {
    const settingsCollection = await getCollection<SliderSettings>(COLLECTIONS.SLIDER_SETTINGS)
    
    let settings = await settingsCollection.findOne({})
    
    if (!settings) {
      settings = {
        id: uuidv4(),
        ...DEFAULT_SLIDER_SETTINGS,
        updated_at: new Date()
      }
      await settingsCollection.insertOne(settings)
    }
    
    return settings
  }
  
  // Update slider settings
  static async updateSettings(data: Partial<SliderSettings>): Promise<SliderSettings> {
    const settingsCollection = await getCollection<SliderSettings>(COLLECTIONS.SLIDER_SETTINGS)
    
    const current = await this.getSettings()
    
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date()
    }
    
    delete updateData.id
    
    await settingsCollection.updateOne(
      { id: current.id },
      { $set: updateData }
    )
    
    return this.getSettings()
  }
}
