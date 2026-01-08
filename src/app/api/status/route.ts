import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export async function GET(request: NextRequest) {
  try {
    const mongoUrl = process.env.MONGO_URL || 'not configured'
    const dbName = process.env.DB_NAME || 'wetnose_db'
    
    // Mask the MongoDB URL for security (show only host)
    let maskedHost = 'unknown'
    try {
      if (mongoUrl && mongoUrl !== 'not configured') {
        const url = new URL(mongoUrl.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://'))
        maskedHost = url.hostname
        // Further mask if it contains sensitive info
        if (maskedHost.includes('.mongodb.net')) {
          maskedHost = maskedHost.split('.')[0] + '.mongodb.net'
        }
      }
    } catch {
      maskedHost = mongoUrl.includes('localhost') ? 'localhost' : 'configured'
    }
    
    // Test database connection
    let dbConnected = false
    let collectionsCount = 0
    try {
      const db = await getDatabase()
      const collections = await db.listCollections().toArray()
      collectionsCount = collections.length
      dbConnected = true
    } catch (error) {
      console.error('DB connection test failed:', error)
    }
    
    return NextResponse.json({
      status: 'ok',
      environment: process.env.APP_ENV || 'preview',
      database: {
        name: dbName,
        host: maskedHost,
        connected: dbConnected,
        collections_count: collectionsCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to get status',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
