'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Users, Settings, FileText, ClipboardList,
  Stethoscope, UsersRound, ImageIcon, MessageSquare, LogOut,
  Menu, X, ChevronRight, Shield, Bell, Sparkles, Calendar, SlidersHorizontal, Mail, Wrench, KeyRound
} from 'lucide-react'
import { useAuthStore, canAccessPage, UserRole } from '@/lib/adminAuth'
import { adminApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: string
  disabled?: boolean
  highlight?: boolean
}

const navItems: NavItem[] = [
  // 📊 Günlük İşlemler (En sık kullanılan)
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/crm', icon: ClipboardList, label: 'Randevu Talepleri' },
  { href: '/admin/contact', icon: Mail, label: 'İletişim Mesajları', badge: 'YENİ', highlight: true },
  
  // 📝 İçerik Yönetimi
  { href: '/admin/blog', icon: FileText, label: 'Blog' },
  { href: '/admin/blog/ai-writer', icon: Sparkles, label: 'AI Blog Writer' },
  { href: '/admin/slider', icon: SlidersHorizontal, label: 'Slider Yönetimi' },
  { href: '/admin/gallery', icon: ImageIcon, label: 'Galeri' },
  { href: '/admin/clinic-rhythm', icon: Calendar, label: 'Klinik Ritmi' },
  
  // 🏥 Site Bilgileri
  { href: '/admin/services', icon: Stethoscope, label: 'Hizmetler' },
  { href: '/admin/team', icon: UsersRound, label: 'Ekip' },
  { href: '/admin/testimonials', icon: MessageSquare, label: 'Yorumlar' },
  
  // ⚙️ Yönetim & Ayarlar (En altta)
  { href: '/admin/users', icon: Users, label: 'Kullanıcılar' },
  { href: '/admin/roles', icon: KeyRound, label: 'Yetki Yönetimi' },
  { href: '/admin/audit-logs', icon: Shield, label: 'Audit Logları' },
  { href: '/admin/settings', icon: Settings, label: 'Ayarlar' },
  { href: '/admin/maintenance', icon: Wrench, label: 'Bakım Modu', highlight: true },
]

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await adminApi.logout()
    logout()
    router.push('/admin/login')
  }

  if (!mounted) return null

  const filteredNavItems = navItems.filter(item => {
    if (!user) return false
    const page = item.href.replace('/admin/', '') || 'dashboard'
    return canAccessPage(user.role as UserRole, page)
  })

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    reception: 'bg-green-500/20 text-green-400 border-green-500/30',
    editor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    manager: 'Yönetici',
    reception: 'Resepsiyon',
    editor: 'Editör',
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-gray-700"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center justify-center">
            <Image
              src="/images/brand/logo.png"
              alt="WETNOSE Logo"
              width={200}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 mx-4 mt-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                roleColors[user.role] || roleColors.editor
              )}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 cursor-not-allowed"
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">
                      {item.badge}
                    </span>
                  )}
                </div>
              )
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    : item.highlight
                    ? "text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", item.highlight && !isActive && "text-purple-400")} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    item.highlight 
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-teal-500/20 text-teal-300"
                  )}>
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && <ChevronRight className="w-4 h-4" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  )
}
