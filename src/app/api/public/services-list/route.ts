import { NextRequest, NextResponse } from 'next/server'
import { ServiceService } from '@/lib/services/service-service'

export async function GET() {
  try {
    const services = await ServiceService.getPublished()
    
    return NextResponse.json({
      services: services.map(s => ({
        id: s.id,
        title: s.title
      }))
    })
  } catch (error) {
    console.error('Get services list error:', error)
    return NextResponse.json(
      { detail: 'Hizmet listesi alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
