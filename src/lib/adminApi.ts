// Admin API Client
// API URL uses the same origin - Kubernetes ingress routes /api to backend

interface ApiResponse<T> {
  data?: T
  error?: string
}

class AdminApi {
  private getApiUrl(): string {
    // In Kubernetes/production environments, ingress routes /api to backend on same origin
    // So we should return empty string to use relative URLs (/api/...)
    // NEXT_PUBLIC_BACKEND_URL is only needed for external/different domain APIs
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (envUrl) return envUrl
    // For production preview and local development, use relative URLs (empty string)
    // This allows the ingress/proxy to route /api/* correctly
    return ''
  }
  
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('wetnose-admin-auth')
    if (!stored) return null
    try {
      const parsed = JSON.parse(stored)
      return parsed.state?.accessToken || null
    } catch {
      return null
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }
    
    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.getApiUrl()}${endpoint}`, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry request with new token
          return this.request(endpoint, options)
        }
        // Clear auth state if refresh failed
        localStorage.removeItem('wetnose-admin-auth')
        window.location.href = '/admin/login'
        return { error: 'Oturum süresi doldu' }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // For 429 rate limit errors, return the detailed info
        if (response.status === 429 && errorData.detail) {
          return { 
            error: errorData.detail.message || errorData.detail.error || 'Çok fazla istek',
            data: errorData.detail as T  // Contains retry_after_seconds
          }
        }
        
        return { error: errorData.detail || 'Bir hata oluştu' }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('API Error:', error)
      return { error: 'Bağlantı hatası' }
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const stored = localStorage.getItem('wetnose-admin-auth')
      if (!stored) return false
      
      const parsed = JSON.parse(stored)
      const refreshToken = parsed.state?.refreshToken
      if (!refreshToken) return false

      const response = await fetch(`${this.getApiUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) return false

      const data = await response.json()
      
      // Update stored tokens
      parsed.state.accessToken = data.access_token
      parsed.state.refreshToken = data.refresh_token
      localStorage.setItem('wetnose-admin-auth', JSON.stringify(parsed))
      
      return true
    } catch {
      return false
    }
  }

  // Auth endpoints
  async login(email: string, password: string, rememberMe: boolean = false) {
    return this.request<{
      access_token: string
      refresh_token: string
      user: {
        id: string
        email: string
        full_name: string
        role: string
        avatar_url: string | null
        must_change_password?: boolean
      }
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    })
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' })
  }

  async getMe() {
    return this.request<{
      id: string
      email: string
      full_name: string
      role: string
      status: string
      avatar_url: string | null
      last_login: string | null
    }>('/api/auth/me')
  }

  // Users endpoints
  async getUsers(page = 1, pageSize = 20, role?: string, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (role) params.append('role', role)
    if (status) params.append('status', status)
    
    return this.request<{
      users: Array<{
        id: string
        email: string
        full_name: string
        role: string
        status: string
        phone: string | null
        avatar_url: string | null
        last_login: string | null
        created_at: string
        updated_at: string
      }>
      total: number
      page: number
      page_size: number
    }>(`/api/admin/users?${params}`)
  }

  async createUser(data: {
    email: string
    password: string
    full_name: string
    role: string
    phone?: string
  }) {
    return this.request<{ message: string; user_id: string }>(
      '/api/admin/users',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  }

  async updateUser(
    userId: string,
    data: {
      email?: string
      full_name?: string
      role?: string
      status?: string
      phone?: string
    }
  ) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async resetUserPassword(userId: string, newPassword: string) {
    return this.request(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, new_password: newPassword }),
    })
  }

  async deactivateUser(userId: string) {
    return this.request(`/api/admin/users/${userId}/deactivate`, {
      method: 'POST',
    })
  }

  async activateUser(userId: string) {
    return this.request(`/api/admin/users/${userId}/activate`, {
      method: 'POST',
    })
  }

  // Settings endpoints
  async getSettings() {
    return this.request<{
      id: string
      clinic_name: string
      phone: string
      whatsapp: string
      email: string
      address: string
      city: string
      district: string
      maps_embed_url: string | null
      facebook_url: string | null
      instagram_url: string | null
      twitter_url: string | null
      youtube_url: string | null
      pinterest_url: string | null
      tiktok_url: string | null
      working_hours: Array<{
        day: string
        open_time: string
        close_time: string
        is_closed: boolean
      }>
      is_24_7_emergency: boolean
      kvkk_text: string | null
      maintenance_mode: boolean
      maintenance_message: string | null
      maintenance_end_date: string | null
      updated_at: string
      updated_by: string | null
    }>('/api/admin/settings')
  }

  async updateSettings(data: Record<string, unknown>) {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Audit logs endpoints
  async getAuditLogs(
    page = 1,
    pageSize = 50,
    filters?: {
      entity_type?: string
      action?: string
      actor_user_id?: string
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (filters?.entity_type) params.append('entity_type', filters.entity_type)
    if (filters?.action) params.append('action', filters.action)
    if (filters?.actor_user_id) params.append('actor_user_id', filters.actor_user_id)
    
    return this.request<{
      logs: Array<{
        id: string
        actor_user_id: string | null
        actor_email: string | null
        actor_role: string | null
        entity_type: string
        entity_id: string | null
        action: string
        before_state: Record<string, unknown> | null
        after_state: Record<string, unknown> | null
        metadata: Record<string, unknown> | null
        ip_address: string | null
        user_agent: string | null
        timestamp: string
        success: boolean
        error_message: string | null
      }>
      total: number
      page: number
      page_size: number
    }>(`/api/admin/audit-logs?${params}`)
  }

  // Preview token
  async getPreviewToken() {
    return this.request<{
      preview_token: string
      expires_in: number
      message: string
    }>('/api/admin/preview/token', {
      method: 'POST',
    })
  }

  // Open preview in new tab
  async openPreview(contentType: 'blog' | 'service' | 'team' | 'clinic-rhythm' | 'testimonial', contentId: string) {
    const tokenResponse = await this.getPreviewToken()
    
    if (tokenResponse.error || !tokenResponse.data) {
      return { error: tokenResponse.error || 'Token alınamadı' }
    }
    
    const token = tokenResponse.data.preview_token
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    
    const pathMap: Record<string, string> = {
      'blog': '/preview/saglik-rehberi',
      'service': '/preview/hizmetler',
      'team': '/preview/ekibimiz',
      'clinic-rhythm': '/preview/klinik-ritmi',
      'testimonial': '/preview/testimonials',
    }
    
    const previewUrl = `${baseUrl}${pathMap[contentType]}/${contentId}?token=${token}`
    window.open(previewUrl, '_blank')
    
    return { data: { url: previewUrl } }
  }

  // Copy preview link to clipboard
  async copyPreviewLink(contentType: 'blog' | 'service' | 'team' | 'clinic-rhythm' | 'testimonial', contentId: string) {
    const tokenResponse = await this.getPreviewToken()
    
    if (tokenResponse.error || !tokenResponse.data) {
      return { error: tokenResponse.error || 'Token alınamadı' }
    }
    
    const token = tokenResponse.data.preview_token
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    
    const pathMap: Record<string, string> = {
      'blog': '/preview/saglik-rehberi',
      'service': '/preview/hizmetler',
      'team': '/preview/ekibimiz',
      'clinic-rhythm': '/preview/klinik-ritmi',
      'testimonial': '/preview/testimonials',
    }
    
    const previewUrl = `${baseUrl}${pathMap[contentType]}/${contentId}?token=${token}`
    
    await navigator.clipboard.writeText(previewUrl)
    
    return { data: { url: previewUrl, expires_in: tokenResponse.data.expires_in } }
  }

  // Services endpoints
  async getServices(page = 1, limit = 20, filters?: { status?: string; archived?: boolean; search?: string }) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (filters?.status) params.append('status', filters.status)
    if (filters?.archived) params.append('archived', 'true')
    if (filters?.search) params.append('search', filters.search)
    
    return this.request<{
      services: Array<{
        id: string
        title: string
        slug: string
        short_description: string
        long_description: string | null
        cover_image_url: string
        cover_image_alt: string | null
        icon: string | null
        price_mode: string
        price_value: number | null
        tags: string[]
        category: string | null
        seo: { meta_title: string | null; meta_description: string | null; og_image_url: string | null }
        status: string
        sort_order: number
        archived_at: string | null
        created_at: string
        updated_at: string
      }>
      total: number
      page: number
      page_size: number
    }>(`/api/admin/services?${params}`)
  }

  async getServiceById(id: string) {
    return this.request<{
      id: string
      title: string
      slug: string
      short_description: string
      long_description: string | null
      cover_image_url: string
      cover_image_alt: string | null
      icon: string | null
      price_mode: string
      price_value: number | null
      tags: string[]
      category: string | null
      seo: { meta_title: string | null; meta_description: string | null; og_image_url: string | null }
      status: string
      sort_order: number
    }>(`/api/admin/services/${id}`)
  }

  async createService(data: Record<string, unknown>) {
    return this.request<{ message: string; id: string; slug: string }>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateService(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateServiceStatus(id: string, status: string) {
    return this.request(`/api/admin/services/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async reorderServices(items: Array<{ id: string; sort_order: number }>) {
    return this.request('/api/admin/services/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    })
  }

  async deleteService(id: string) {
    return this.request(`/api/admin/services/${id}`, { method: 'DELETE' })
  }

  async restoreService(id: string) {
    return this.request(`/api/admin/services/${id}/restore`, { method: 'POST' })
  }

  // Team Members endpoints
  async getTeamMembers(page = 1, limit = 20, filters?: { status?: string; archived?: boolean; search?: string }) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (filters?.status) params.append('status', filters.status)
    if (filters?.archived) params.append('archived', 'true')
    if (filters?.search) params.append('search', filters.search)
    
    return this.request<{
      team_members: Array<{
        id: string
        full_name: string
        slug: string
        role_title: string
        specialties: string[]
        bio: string | null
        photo_url: string
        photo_alt: string | null
        social_links: { instagram?: string; linkedin?: string; twitter?: string; facebook?: string }
        experience: string | null
        quote: string | null
        is_owner: boolean
        status: string
        sort_order: number
        archived_at: string | null
        created_at: string
        updated_at: string
      }>
      total: number
      page: number
      page_size: number
    }>(`/api/admin/team-members?${params}`)
  }

  async getTeamMemberById(id: string) {
    return this.request<{
      id: string
      full_name: string
      slug: string
      role_title: string
      specialties: string[]
      bio: string | null
      photo_url: string
      social_links: { instagram?: string; linkedin?: string }
      experience: string | null
      quote: string | null
      is_owner: boolean
      status: string
      sort_order: number
    }>(`/api/admin/team-members/${id}`)
  }

  async createTeamMember(data: Record<string, unknown>) {
    return this.request<{ message: string; id: string; slug: string }>('/api/admin/team-members', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTeamMember(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/team-members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateTeamMemberStatus(id: string, status: string) {
    return this.request(`/api/admin/team-members/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async reorderTeamMembers(items: Array<{ id: string; sort_order: number }>) {
    return this.request('/api/admin/team-members/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ items }),
    })
  }

  async deleteTeamMember(id: string) {
    return this.request(`/api/admin/team-members/${id}`, { method: 'DELETE' })
  }

  async restoreTeamMember(id: string) {
    return this.request(`/api/admin/team-members/${id}/restore`, { method: 'POST' })
  }

  // CRM Endpoints
  async getAppointments(
    page = 1,
    pageSize = 20,
    filters?: {
      status?: string
      lead_heat?: string
      assigned_to?: string
      search?: string
      sort_by?: string
      sort_order?: string
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (filters?.status) params.append('status', filters.status)
    if (filters?.lead_heat) params.append('lead_heat', filters.lead_heat)
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)

    return this.request<{
      appointments: Array<{
        id: string
        name: string
        phone: string
        email: string | null
        pet_name: string | null
        pet_type: string | null
        pet_breed: string | null
        service_requested: string | null
        preferred_date: string | null
        preferred_time: string | null
        message: string | null
        source: string
        status: string
        assigned_to: string | null
        assigned_to_email: string | null
        follow_up_at: string | null
        notes: Array<{
          id: string
          content: string
          created_by: string
          created_by_email: string
          created_at: string
        }>
        lead_score: number
        lead_heat: string
        lead_score_reasons: Array<{
          factor: string
          points: number
          description: string
        }>
        created_at: string
        updated_at: string
        contacted_at: string | null
        scheduled_at: string | null
        completed_at: string | null
      }>
      total: number
      page: number
      page_size: number
    }>(`/api/admin/crm/appointments?${params}`)
  }

  async getAppointmentStats() {
    return this.request<{
      total: number
      new: number
      contacted: number
      scheduled: number
      completed: number
      cancelled: number
      no_show: number
      hot_leads: number
      warm_leads: number
      cold_leads: number
      today_follow_ups: number
    }>('/api/admin/crm/appointments/stats')
  }

  async getAppointmentById(id: string) {
    return this.request<{
      id: string
      name: string
      phone: string
      email: string | null
      pet_name: string | null
      pet_type: string | null
      pet_breed: string | null
      service_requested: string | null
      preferred_date: string | null
      preferred_time: string | null
      message: string | null
      source: string
      status: string
      assigned_to: string | null
      assigned_to_email: string | null
      follow_up_at: string | null
      notes: Array<{
        id: string
        content: string
        created_by: string
        created_by_email: string
        created_at: string
      }>
      lead_score: number
      lead_heat: string
      lead_score_reasons: Array<{
        factor: string
        points: number
        description: string
      }>
      created_at: string
      updated_at: string
      contacted_at: string | null
      scheduled_at: string | null
      completed_at: string | null
    }>(`/api/admin/crm/appointments/${id}`)
  }

  async createAppointment(data: {
    name: string
    phone: string
    email?: string
    pet_name?: string
    pet_type?: string
    pet_breed?: string
    service_requested?: string
    preferred_date?: string
    preferred_time?: string
    message?: string
    source?: string
  }) {
    return this.request('/api/admin/crm/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAppointment(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/crm/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateAppointmentStatus(id: string, status: string) {
    return this.request(`/api/admin/crm/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async assignAppointment(id: string, assignedTo: string) {
    return this.request(`/api/admin/crm/appointments/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to: assignedTo }),
    })
  }

  async setAppointmentFollowUp(id: string, followUpAt: string) {
    return this.request(`/api/admin/crm/appointments/${id}/follow-up`, {
      method: 'PATCH',
      body: JSON.stringify({ follow_up_at: followUpAt }),
    })
  }

  async addAppointmentNote(id: string, content: string) {
    return this.request(`/api/admin/crm/appointments/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async exportAppointmentsCSV(filters?: {
    status?: string
    lead_heat?: string
    assigned_to?: string
    date_from?: string
    date_to?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.lead_heat) params.append('lead_heat', filters.lead_heat)
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to)
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)

    const token = this.getToken()
    const response = await fetch(`${this.getApiUrl()}/api/admin/crm/appointments/export/csv?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('CSV export failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `randevu_talepleri_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  // Gallery Upload
  async uploadGalleryImage(formData: FormData) {
    const token = this.getToken()
    
    // First ensure 'ekip' album exists or create it
    let albumId = 'ekip'
    
    try {
      // Try to get existing album
      const albumsRes = await this.request<{ albums: Array<{ id: string; slug: string }> }>('/api/admin/gallery/albums')
      const ekipAlbum = albumsRes.data?.albums.find(a => a.slug === 'ekip')
      
      if (!ekipAlbum) {
        // Create album
        const createRes = await this.request<{ id: string }>('/api/admin/gallery/albums', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Ekip',
            slug: 'ekip',
            description: 'Ekip üyesi fotoğrafları',
            status: 'published'
          })
        })
        if (createRes.data?.id) {
          albumId = createRes.data.id
        }
      } else {
        albumId = ekipAlbum.id
      }
    } catch (e) {
      console.error('Album check failed:', e)
    }
    
    // Upload to album
    const response = await fetch(`${this.getApiUrl()}/api/admin/gallery/albums/${albumId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { data: null, error: errorData.detail || 'Yükleme başarısız' }
    }
    
    const data = await response.json()
    // Return first uploaded image URL
    if (data.images && data.images.length > 0) {
      return { data: { url: data.images[0].url }, error: null }
    }
    return { data: null, error: 'Resim yüklenemedi' }
  }

  // Dashboard Endpoints
  async getDashboardStats() {
    return this.request<{
      today_summary: {
        new_requests: number
        contacted: number
        scheduled: number
        hot_leads: number
        today_follow_ups: number
        overdue_follow_ups: number
      }
      follow_ups_today: Array<{
        id: string
        name: string
        phone: string
        email: string | null
        pet_name: string | null
        service_requested: string | null
        follow_up_at: string | null
        status: string
        lead_heat: string
        lead_score: number
        is_overdue: boolean
      }>
      overdue_follow_ups: Array<{
        id: string
        name: string
        phone: string
        email: string | null
        pet_name: string | null
        service_requested: string | null
        follow_up_at: string | null
        status: string
        lead_heat: string
        lead_score: number
        is_overdue: boolean
      }>
      weekly_trend: Array<{
        date: string
        count: number
      }>
    }>('/api/admin/dashboard/stats')
  }

  // Version History Endpoints
  async getServiceVersions(serviceId: string) {
    return this.request<{
      versions: Array<{
        id: string
        entity_type: string
        entity_id: string
        version_no: number
        snapshot: Record<string, unknown>
        change_reason: string | null
        created_at: string
        created_by: string
        created_by_email: string
      }>
      total: number
    }>(`/api/admin/services/${serviceId}/versions`)
  }

  async restoreServiceVersion(serviceId: string, versionId: string, changeReason?: string) {
    return this.request(`/api/admin/services/${serviceId}/versions/${versionId}/restore`, {
      method: 'POST',
      body: JSON.stringify({ change_reason: changeReason || 'Versiyon geri yüklendi' }),
    })
  }

  async getTeamMemberVersions(memberId: string) {
    return this.request<{
      versions: Array<{
        id: string
        entity_type: string
        entity_id: string
        version_no: number
        snapshot: Record<string, unknown>
        change_reason: string | null
        created_at: string
        created_by: string
        created_by_email: string
      }>
      total: number
    }>(`/api/admin/team-members/${memberId}/versions`)
  }

  async restoreTeamMemberVersion(memberId: string, versionId: string, changeReason?: string) {
    return this.request(`/api/admin/team-members/${memberId}/versions/${versionId}/restore`, {
      method: 'POST',
      body: JSON.stringify({ change_reason: changeReason || 'Versiyon geri yüklendi' }),
    })
  }

  // Testimonials Endpoints
  async getTestimonials(
    page = 1,
    pageSize = 20,
    filters?: {
      status?: string
      rating?: number
      service_id?: string
      feedback_type?: string
      consent_public?: boolean
      search?: string
      include_archived?: boolean
      sort_by?: string
      sort_order?: string
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (filters?.status) params.append('status', filters.status)
    if (filters?.rating) params.append('rating', filters.rating.toString())
    if (filters?.service_id) params.append('service_id', filters.service_id)
    if (filters?.feedback_type) params.append('feedback_type', filters.feedback_type)
    if (filters?.consent_public !== undefined) params.append('consent_public', filters.consent_public.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.include_archived) params.append('include_archived', 'true')
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.sort_order) params.append('sort_order', filters.sort_order)

    return this.request<{
      testimonials: Array<{
        id: string
        full_name: string
        email: string | null
        phone: string | null
        pet_name: string
        pet_photo_url: string | null
        service_id: string | null
        service_name_snapshot: string | null
        rating: number
        feedback_type: string
        comment: string
        consent_internal: boolean
        consent_public: boolean
        status: string
        admin_note: string | null
        submitted_at: string
        approved_at: string | null
        approved_by: string | null
        approved_by_email: string | null
        source: string
        archived_at: string | null
        sort_order: number
      }>
      total: number
      page: number
      page_size: number
    }>(`/api/admin/testimonials?${params}`)
  }

  async getTestimonialAnalytics() {
    return this.request<{
      overall_avg_rating: number
      last_30_days_avg_rating: number
      total_count: number
      rating_distribution: Array<{ rating: number; count: number; percentage: number }>
      positive_count: number
      neutral_count: number
      negative_count: number
      positive_ratio: number
      service_stats: Array<{ service_id: string; service_name: string; count: number; avg_rating: number }>
      attention_needed_count: number
      pending_count: number
    }>('/api/admin/testimonials/analytics')
  }

  async getTestimonialById(id: string) {
    return this.request<{
      id: string
      full_name: string
      email: string | null
      phone: string | null
      pet_name: string
      pet_photo_url: string | null
      service_id: string | null
      service_name_snapshot: string | null
      rating: number
      feedback_type: string
      comment: string
      consent_internal: boolean
      consent_public: boolean
      status: string
      admin_note: string | null
      submitted_at: string
      approved_at: string | null
      approved_by: string | null
      approved_by_email: string | null
      source: string
      archived_at: string | null
      sort_order: number
    }>(`/api/admin/testimonials/${id}`)
  }

  async createTestimonial(data: {
    full_name: string
    pet_name: string
    rating: number
    comment: string
    email?: string
    phone?: string
    pet_type?: string
    pet_photo_url?: string
    owner_photo_url?: string
    treatment?: string
    service_id?: string
    feedback_type?: string
    consent_public?: boolean
    consent_internal?: boolean
    status?: string
    admin_note?: string
  }) {
    return this.request<{ message: string; id: string }>('/api/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTestimonial(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateTestimonialStatus(id: string, status: string) {
    return this.request(`/api/admin/testimonials/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async bulkTestimonialAction(ids: string[], action: 'approve' | 'reject' | 'archive') {
    return this.request<{ message: string; modified_count: number }>('/api/admin/testimonials/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, action }),
    })
  }

  async archiveTestimonial(id: string) {
    return this.request(`/api/admin/testimonials/${id}/archive`, {
      method: 'POST',
    })
  }

  async restoreTestimonial(id: string) {
    return this.request(`/api/admin/testimonials/${id}/restore`, {
      method: 'POST',
    })
  }

  async deleteTestimonial(id: string) {
    return this.request(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
    })
  }

  // ============ AI Blog Methods ============
  
  async getAIRevisionTemplates() {
    return this.request<{
      templates: Array<{
        id: string
        label: string
        instruction: string
      }>
    }>('/api/admin/ai-blog/revision-templates')
  }

  async reviseWithAI(blogPostId: string, instruction: string) {
    return this.request<{
      success: boolean
      message: string
      data: {
        generation_id: string
        blog_post_id: string
        output: {
          title?: string
          content_html?: string
          meta_title?: string
          meta_description?: string
          faq?: Array<{ question: string; answer: string }>
          change_summary?: string
        }
        processing_time_ms: number
        status: string
      }
    }>('/api/admin/ai-blog/revise', {
      method: 'POST',
      body: JSON.stringify({
        blog_post_id: blogPostId,
        instruction
      })
    })
  }

  async getAIGenerationHistory(blogPostId?: string, limit: number = 20) {
    const params = new URLSearchParams()
    if (blogPostId) params.append('blog_post_id', blogPostId)
    params.append('limit', limit.toString())
    
    return this.request<{
      generations: Array<{
        id: string
        created_at: string
        is_revision: boolean
        revision_instruction?: string
        status: string
        processing_time_ms: number
      }>
      total: number
    }>(`/api/admin/ai-blog/history?${params.toString()}`)
  }

  // ============ Contact Messages Methods ============
  
  async getContactMessages(params: {
    page?: number
    limit?: number
    status?: string
    search?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.status) searchParams.append('status', params.status)
    if (params.search) searchParams.append('search', params.search)
    
    return this.request<{
      messages: Array<{
        id: string
        name: string
        email: string
        phone: string | null
        subject: string
        message: string
        status: string
        created_at: string
        read_at: string | null
        replied_at: string | null
      }>
      total: number
      page: number
      limit: number
    }>(`/api/admin/contact/messages?${searchParams}`)
  }

  async getContactStats() {
    return this.request<{
      total: number
      new: number
      read: number
      replied: number
      archived: number
    }>('/api/admin/contact/messages/stats')
  }

  async getContactMessage(messageId: string) {
    return this.request<{
      id: string
      name: string
      email: string
      phone: string | null
      subject: string
      message: string
      status: string
      created_at: string
      read_at: string | null
      replied_at: string | null
    }>(`/api/admin/contact/messages/${messageId}`)
  }

  async updateContactStatus(messageId: string, status: string) {
    return this.request(`/api/admin/contact/messages/${messageId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async deleteContactMessage(messageId: string) {
    return this.request(`/api/admin/contact/messages/${messageId}`, {
      method: 'DELETE',
    })
  }

  // ============ Slider Management Methods ============
  
  async getSlides(includeInactive: boolean = true) {
    const params = new URLSearchParams()
    if (includeInactive) params.append('include_inactive', 'true')
    return this.request<{
      slides: Array<{
        id: string
        title: string
        subtitle: string | null
        image_url: string
        image_alt: string | null
        mobile_image_url: string | null
        buttons: Array<{
          id: string
          text: string
          href: string
          style: string
          icon: string | null
          is_visible: boolean
        }>
        overlay: {
          enabled: boolean
          opacity: number
          gradient_direction: string
          color: string
        }
        is_active: boolean
        sort_order: number
        animation_duration: number
        created_at: string
        updated_at: string
      }>
      total: number
    }>(`/api/admin/slider/slides?${params}`)
  }

  async getSlide(slideId: string) {
    return this.request<{
      id: string
      title: string
      subtitle: string | null
      image_url: string
      image_alt: string | null
      mobile_image_url: string | null
      buttons: Array<{
        id: string
        text: string
        href: string
        style: string
        icon: string | null
        is_visible: boolean
      }>
      overlay: {
        enabled: boolean
        opacity: number
        gradient_direction: string
        color: string
      }
      is_active: boolean
      sort_order: number
      animation_duration: number
      created_at: string
      updated_at: string
    }>(`/api/admin/slider/slides/${slideId}`)
  }

  async createSlide(data: {
    title: string
    subtitle?: string
    image_url: string
    image_alt?: string
    mobile_image_url?: string
    buttons?: Array<{
      text: string
      href: string
      style?: string
      icon?: string
      is_visible?: boolean
    }>
    overlay?: {
      enabled?: boolean
      opacity?: number
      gradient_direction?: string
      color?: string
    }
    is_active?: boolean
    animation_duration?: number
  }) {
    return this.request<{ message: string; id: string }>('/api/admin/slider/slides', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSlide(slideId: string, data: {
    title?: string
    subtitle?: string
    image_url?: string
    image_alt?: string
    mobile_image_url?: string
    buttons?: Array<{
      text: string
      href: string
      style?: string
      icon?: string
      is_visible?: boolean
    }>
    overlay?: {
      enabled?: boolean
      opacity?: number
      gradient_direction?: string
      color?: string
    }
    is_active?: boolean
    sort_order?: number
    animation_duration?: number
  }) {
    return this.request(`/api/admin/slider/slides/${slideId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSlide(slideId: string) {
    return this.request(`/api/admin/slider/slides/${slideId}`, {
      method: 'DELETE',
    })
  }

  async reorderSlides(items: Array<{ id: string; sort_order: number }>) {
    return this.request('/api/admin/slider/slides/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
  }

  async seedSlides() {
    return this.request('/api/admin/slider/slides/seed', {
      method: 'POST',
    })
  }

  async getSliderSettings() {
    return this.request<{
      id: string
      auto_play: boolean
      auto_play_interval: number
      show_navigation_arrows: boolean
      show_navigation_dots: boolean
      show_progress_bar: boolean
      show_slide_counter: boolean
      show_scroll_indicator: boolean
      badge: {
        enabled: boolean
        text: string
        icon: string
        show_pulse: boolean
      }
      stats: {
        enabled: boolean
        items: Array<{ value: string; label: string }>
      }
      ken_burns_effect: boolean
      scan_line_effect: boolean
      updated_at: string
    }>('/api/admin/slider/settings')
  }

  async updateSliderSettings(data: {
    auto_play?: boolean
    auto_play_interval?: number
    show_navigation_arrows?: boolean
    show_navigation_dots?: boolean
    show_progress_bar?: boolean
    show_slide_counter?: boolean
    show_scroll_indicator?: boolean
    badge?: {
      enabled?: boolean
      text?: string
      icon?: string
      show_pulse?: boolean
    }
    stats?: {
      enabled?: boolean
      items?: Array<{ value: string; label: string }>
    }
    ken_burns_effect?: boolean
    scan_line_effect?: boolean
  }) {
    return this.request('/api/admin/slider/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ============ Clinic Rhythm Methods ============
  
  async getClinicRhythmEntries(params?: {
    status?: string
    date_from?: string
    date_to?: string
    skip?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.date_from) searchParams.append('date_from', params.date_from)
    if (params?.date_to) searchParams.append('date_to', params.date_to)
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    return this.request<{
      entries: Array<{
        id: string
        date_key: string
        featured_question: {
          question_text: string
          short_answer: string
          related_blog_slug?: string
          related_blog_title?: string
          source_hint?: string
        } | null
        false_alarm: {
          message_title?: string
          message_body: string
          supportive_line: string
        } | null
        status: string
        created_by?: string
        updated_by?: string
        created_at?: string
        updated_at?: string
        published_at?: string
      }>
      total: number
    }>(`/api/admin/clinic-rhythm?${searchParams.toString()}`)
  }

  async getClinicRhythmEntry(id: string) {
    return this.request<{
      id: string
      date_key: string
      featured_question: {
        question_text: string
        short_answer: string
        related_blog_slug?: string
        related_blog_title?: string
        source_hint?: string
      } | null
      false_alarm: {
        message_title?: string
        message_body: string
        supportive_line: string
      } | null
      status: string
      created_by?: string
      updated_by?: string
      created_at?: string
      updated_at?: string
      published_at?: string
    }>(`/api/admin/clinic-rhythm/${id}`)
  }

  async createClinicRhythmEntry(data: {
    date_key: string
    featured_question?: {
      question_text: string
      short_answer: string
      related_blog_slug?: string
      related_blog_title?: string
      source_hint?: string
    }
    false_alarm?: {
      message_title?: string
      message_body: string
      supportive_line?: string
    }
  }) {
    return this.request<{ message: string; id: string }>('/api/admin/clinic-rhythm', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateClinicRhythmEntry(id: string, data: {
    featured_question?: {
      question_text: string
      short_answer: string
      related_blog_slug?: string
      related_blog_title?: string
      source_hint?: string
    } | null
    false_alarm?: {
      message_title?: string
      message_body: string
      supportive_line?: string
    } | null
  }) {
    return this.request(`/api/admin/clinic-rhythm/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async updateClinicRhythmStatus(id: string, status: 'draft' | 'published' | 'archived') {
    return this.request(`/api/admin/clinic-rhythm/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }

  async deleteClinicRhythmEntry(id: string) {
    return this.request(`/api/admin/clinic-rhythm/${id}`, {
      method: 'DELETE'
    })
  }

  // ============ Pool Management Methods ============

  async getPoolStats() {
    return this.request<{
      total_questions: number
      total_alarms: number
      active_questions: number
      active_alarms: number
      total_combinations: number
    }>('/api/admin/clinic-rhythm/pool/stats')
  }

  async seedPool() {
    return this.request<{
      seeded: boolean
      message: string
      questions: number
      alarms: number
    }>('/api/admin/clinic-rhythm/pool/seed', {
      method: 'POST'
    })
  }

  // Question Pool
  async getPoolQuestions(params?: {
    status?: string
    category?: string
    search?: string
    skip?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    return this.request<{
      questions: Array<{
        id: string
        question_text: string
        short_answer: string
        related_blog_slug?: string
        related_blog_title?: string
        category?: string
        status: string
        usage_count: number
        last_used_date?: string
        created_at?: string
        updated_at?: string
      }>
      total: number
    }>(`/api/admin/clinic-rhythm/pool/questions?${searchParams.toString()}`)
  }

  async createPoolQuestion(data: {
    question_text: string
    short_answer: string
    related_blog_slug?: string
    related_blog_title?: string
    category?: string
  }) {
    return this.request<{ message: string; id: string }>('/api/admin/clinic-rhythm/pool/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePoolQuestion(id: string, data: {
    question_text?: string
    short_answer?: string
    related_blog_slug?: string
    related_blog_title?: string
    category?: string
    status?: string
  }) {
    return this.request('/api/admin/clinic-rhythm/pool/questions/' + id, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePoolQuestion(id: string) {
    return this.request<{ message: string }>('/api/admin/clinic-rhythm/pool/questions/' + id, {
      method: 'DELETE'
    })
  }

  // Alarm Pool
  async getPoolAlarms(params?: {
    status?: string
    category?: string
    search?: string
    skip?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    return this.request<{
      alarms: Array<{
        id: string
        message_title: string
        message_body: string
        supportive_line: string
        category?: string
        status: string
        usage_count: number
        last_used_date?: string
        created_at?: string
        updated_at?: string
      }>
      total: number
    }>(`/api/admin/clinic-rhythm/pool/alarms?${searchParams.toString()}`)
  }

  async createPoolAlarm(data: {
    message_title: string
    message_body: string
    supportive_line: string
    category?: string
  }) {
    return this.request<{ message: string; id: string }>('/api/admin/clinic-rhythm/pool/alarms', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePoolAlarm(id: string, data: {
    message_title?: string
    message_body?: string
    supportive_line?: string
    category?: string
    status?: string
  }) {
    return this.request('/api/admin/clinic-rhythm/pool/alarms/' + id, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePoolAlarm(id: string) {
    return this.request<{ message: string }>('/api/admin/clinic-rhythm/pool/alarms/' + id, {
      method: 'DELETE'
    })
  }

  // ============ Password Change Methods ============
  
  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })
  }

  async forcePasswordReset(userId: string) {
    return this.request<{ message: string }>(`/api/auth/force-password-reset/${userId}`, {
      method: 'POST'
    })
  }
}

export const adminApi = new AdminApi()
