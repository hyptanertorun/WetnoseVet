import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { requireAdminManagerEditor } from '@/lib/middleware/auth'
import { AppointmentService } from '@/lib/services/appointment-service'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminManagerEditor(request)
    if (authResult instanceof NextResponse) return authResult
    
    const stats = await AppointmentService.getStats()
    
    // Get today's date for filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Get follow-ups for today and overdue
    const { appointments } = await AppointmentService.list(1, 100, {})
    
    const todayFollowUps = appointments.filter(a => {
      if (!a.follow_up_at) return false
      const followUpDate = new Date(a.follow_up_at)
      return followUpDate >= today && followUpDate < tomorrow
    }).map(a => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      email: a.email,
      pet_name: a.pet_name,
      service_requested: a.service_requested,
      follow_up_at: a.follow_up_at?.toISOString() || null,
      status: a.status,
      lead_heat: a.lead_heat,
      lead_score: a.lead_score,
      is_overdue: false
    }))
    
    const overdueFollowUps = appointments.filter(a => {
      if (!a.follow_up_at) return false
      const followUpDate = new Date(a.follow_up_at)
      return followUpDate < today && a.status !== 'completed' && a.status !== 'cancelled'
    }).map(a => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      email: a.email,
      pet_name: a.pet_name,
      service_requested: a.service_requested,
      follow_up_at: a.follow_up_at?.toISOString() || null,
      status: a.status,
      lead_heat: a.lead_heat,
      lead_score: a.lead_score,
      is_overdue: true
    }))
    
    // Generate weekly trend (last 7 days)
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayAppointments = appointments.filter(a => {
        const createdDate = new Date(a.created_at).toISOString().split('T')[0]
        return createdDate === dateStr
      })
      weeklyTrend.push({
        date: dateStr,
        count: dayAppointments.length
      })
    }
    
    return NextResponse.json({
      today_summary: {
        new_requests: stats.new,
        contacted: stats.contacted,
        scheduled: stats.scheduled,
        hot_leads: stats.hot_leads,
        today_follow_ups: todayFollowUps.length,
        overdue_follow_ups: overdueFollowUps.length
      },
      follow_ups_today: todayFollowUps,
      overdue_follow_ups: overdueFollowUps,
      weekly_trend: weeklyTrend
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ detail: 'Dashboard istatistikleri alınırken hata oluştu' }, { status: 500 })
  }
}
