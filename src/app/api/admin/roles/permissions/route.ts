import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'

// Define available permissions
const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', description: 'Ana panel erişimi' },
  { key: 'crm', label: 'CRM', description: 'Müşteri ilişkileri yönetimi' },
  { key: 'contact', label: 'İletişim', description: 'İletişim mesajları yönetimi' },
  { key: 'slider', label: 'Slider', description: 'Ana sayfa slider yönetimi' },
  { key: 'clinic_rhythm', label: 'Klinik Ritmi', description: 'Günlük klinik içerikleri' },
  { key: 'services', label: 'Hizmetler', description: 'Hizmet yönetimi' },
  { key: 'team', label: 'Ekip', description: 'Ekip üyeleri yönetimi' },
  { key: 'blog', label: 'Blog', description: 'Blog yazıları yönetimi' },
  { key: 'ai_blog', label: 'AI Blog', description: 'AI destekli içerik oluşturma' },
  { key: 'gallery', label: 'Galeri', description: 'Fotoğraf galerisi yönetimi' },
  { key: 'testimonials', label: 'Yorumlar', description: 'Müşteri yorumları yönetimi' },
  { key: 'users', label: 'Kullanıcılar', description: 'Kullanıcı yönetimi' },
  { key: 'settings', label: 'Ayarlar', description: 'Site ayarları' },
  { key: 'maintenance', label: 'Bakım', description: 'Sistem bakımı' },
  { key: 'audit_logs', label: 'İşlem Kayıtları', description: 'Sistem logları' },
]

// Default role permissions
const DEFAULT_ROLES = [
  {
    role: 'admin',
    role_label: 'Yönetici',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.key), // Admin has all permissions
    is_default: true
  },
  {
    role: 'editor',
    role_label: 'Editör',
    permissions: ['dashboard', 'blog', 'gallery', 'testimonials', 'clinic_rhythm'],
    is_default: true
  },
  {
    role: 'moderator',
    role_label: 'Moderatör',
    permissions: ['dashboard', 'contact', 'testimonials'],
    is_default: true
  },
  {
    role: 'viewer',
    role_label: 'İzleyici',
    permissions: ['dashboard'],
    is_default: true
  }
]

// GET: Fetch all roles and permissions
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.user) {
      return NextResponse.json(
        { detail: authResult.error || 'Yetkisiz erişim' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { detail: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      roles: DEFAULT_ROLES,
      available_permissions: AVAILABLE_PERMISSIONS
    })
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    return NextResponse.json(
      { detail: 'Roller yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
