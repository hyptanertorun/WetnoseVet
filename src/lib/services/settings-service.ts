import { v4 as uuidv4 } from 'uuid'
import { getCollection, COLLECTIONS } from '@/lib/db/mongodb'
import type { Settings, WorkingHour } from '@/lib/models/types'

const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'updated_at' | 'updated_by'> = {
  clinic_name: 'Wetnose Veteriner Kliniği',
  phone: '+90 553 484 54 24',
  whatsapp: '+905534845424',
  emergency_phone: null,
  email: 'info@wetnose.com.tr',
  address: 'Kadıköy Mah. Atatürk Bulvarı Atatürk Ortaokulu Karşısı',
  city: 'Kocaeli',
  district: 'İzmit',
  maps_embed_url: null,
  facebook_url: null,
  instagram_url: 'https://www.instagram.com/wetnoseveteriner/',
  twitter_url: null,
  youtube_url: null,
  pinterest_url: null,
  tiktok_url: null,
  working_hours: [
    { day: 'Pazartesi', open_time: '09:00', close_time: '20:00', is_closed: false },
    { day: 'Salı', open_time: '09:00', close_time: '20:00', is_closed: false },
    { day: 'Çarşamba', open_time: '09:00', close_time: '20:00', is_closed: false },
    { day: 'Perşembe', open_time: '09:00', close_time: '20:00', is_closed: false },
    { day: 'Cuma', open_time: '09:00', close_time: '20:00', is_closed: false },
    { day: 'Cumartesi', open_time: '09:00', close_time: '20:00', is_closed: false },
    { day: 'Pazar', open_time: '09:00', close_time: '20:00', is_closed: true }
  ],
  is_24_7_emergency: false,
  kvkk_text: null,
  maintenance_mode: false,
  maintenance_message: null,
  maintenance_end_date: null
}

export class SettingsService {
  // Get settings (singleton)
  static async getSettings(): Promise<Settings> {
    const settingsCollection = await getCollection<Settings>(COLLECTIONS.SETTINGS)
    
    let settings = await settingsCollection.findOne({})
    
    if (!settings) {
      // Create default settings
      settings = {
        id: uuidv4(),
        ...DEFAULT_SETTINGS,
        updated_at: new Date(),
        updated_by: null
      }
      await settingsCollection.insertOne(settings)
    }
    
    return settings
  }
  
  // Update settings
  static async updateSettings(
    updates: Partial<Omit<Settings, 'id'>>,
    updatedBy?: string
  ): Promise<Settings> {
    const settingsCollection = await getCollection<Settings>(COLLECTIONS.SETTINGS)
    
    // Get current settings (ensures it exists)
    const current = await this.getSettings()
    
    const updateData: Record<string, unknown> = {
      ...updates,
      updated_at: new Date(),
      updated_by: updatedBy || null
    }
    
    delete updateData.id
    
    await settingsCollection.updateOne(
      { id: current.id },
      { $set: updateData }
    )
    
    return this.getSettings()
  }
  
  // Get public settings (for public API)
  static async getPublicSettings(): Promise<{
    clinic_name: string
    phone: string
    whatsapp: string
    emergency_phone: string | null
    email: string
    address: string
    city: string
    district: string
    is_24_7_emergency: boolean
    social_links: {
      facebook: string | null
      instagram: string | null
      twitter: string | null
      youtube: string | null
      pinterest: string | null
      tiktok: string | null
    }
  }> {
    const settings = await this.getSettings()
    
    return {
      clinic_name: settings.clinic_name,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      emergency_phone: settings.emergency_phone,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      district: settings.district,
      is_24_7_emergency: settings.is_24_7_emergency,
      social_links: {
        facebook: settings.facebook_url,
        instagram: settings.instagram_url,
        twitter: settings.twitter_url,
        youtube: settings.youtube_url,
        pinterest: settings.pinterest_url,
        tiktok: settings.tiktok_url
      }
    }
  }
  
  // Get maintenance status
  static async getMaintenanceStatus(): Promise<{
    maintenance_mode: boolean
    maintenance_message: string | null
    maintenance_end_date: string | null
    phone: string
    whatsapp: string
    email: string
  }> {
    const settings = await this.getSettings()
    
    return {
      maintenance_mode: settings.maintenance_mode,
      maintenance_message: settings.maintenance_message,
      maintenance_end_date: settings.maintenance_end_date?.toISOString() || null,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email
    }
  }
}
