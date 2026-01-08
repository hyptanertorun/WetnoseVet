import { MongoClient, Db, Collection } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'wetnose_db'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToMongo(): Promise<Db> {
  if (db) return db
  
  try {
    client = new MongoClient(MONGO_URL)
    await client.connect()
    db = client.db(DB_NAME)
    console.log(`Connected to MongoDB: ${DB_NAME}`)
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    await connectToMongo()
  }
  return db!
}

export async function getCollection<T>(name: string): Promise<Collection<T>> {
  const database = await getDatabase()
  return database.collection<T>(name)
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

// Collection names - keep consistent with existing MongoDB collections
export const COLLECTIONS = {
  USERS: 'users',
  REFRESH_TOKENS: 'refresh_tokens',
  SERVICES: 'services',
  TEAM_MEMBERS: 'team_members',
  BLOG_POSTS: 'blog_posts',
  BLOG_CATEGORIES: 'blog_categories',
  GALLERY_ALBUMS: 'gallery_albums',
  GALLERY_ITEMS: 'gallery_items',
  TESTIMONIALS: 'testimonials',
  SETTINGS: 'settings',
  AUDIT_LOGS: 'audit_logs',
  APPOINTMENTS: 'appointments',
  CLINIC_RHYTHM: 'clinic_rhythm',
  POOL_QUESTIONS: 'pool_questions',
  POOL_ALARMS: 'pool_alarms',
  SLIDES: 'slides',
  SLIDER_SETTINGS: 'slider_settings',
  VERSIONS: 'versions',
  AI_GENERATIONS: 'ai_generations',
  CONTACT_MESSAGES: 'contact_messages',
  ROLE_PERMISSIONS: 'role_permissions'
}
