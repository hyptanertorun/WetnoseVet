'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Settings, FileText, ClipboardList,
  Stethoscope, UsersRound, ImageIcon, MessageSquare, LogOut,
  Menu, X, Shield, Sparkles, CalendarHeart, SlidersHorizontal, Mail, Wrench, KeyRound,
  ChevronDown, Sun, Globe, Megaphone, Cog
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/lib/adminAuth'
import { adminApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  roles: UserRole[]
}

interface NavGroup {
  id: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
  defaultOpen: boolean
  items: NavItem[]
}

const ALL: UserRole[] = ['admin', 'manager', 'reception', 'editor']
const OPS: UserRole[] = ['admin', 'manager', 'reception']
const CONTENT: UserRole[] = ['admin', 'manager', 'editor']

const navGroups: NavGroup[] = [
  {
    id: 'ops',
    label: 'Günlük Operasyon',
    icon: Sun,
    roles: ALL,
    defaultOpen: true,
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Bugün', roles: ALL },
      { href: '/admin/crm', icon: ClipboardList, label: 'Randevu Talepleri', roles: OPS },
      { href: '/admin/contact', icon: Mail, label: 'Mesajlar', roles: OPS },
    ],
  },
  {
    id: 'website',
    label: 'Web Sitesi',
    icon: Globe,
    roles: CONTENT,
    defaultOpen: true,
    items: [
      { href: '/admin/slider', icon: SlidersHorizontal, label: 'Ana Sayfa & Slider', roles: CONTENT },
      { href: '/admin/services', icon: Stethoscope, label: 'Hizmetler', roles: CONTENT },
      { href: '/admin/team', icon: UsersRound, label: 'Ekip', roles: CONTENT },
      { href: '/admin/gallery', icon: ImageIcon, label: 'Galeri', roles: CONTENT },
      { href: '/admin/testimonials', icon: MessageSquare, label: 'Yorumlar', roles: CONTENT },
      { href: '/admin/clinic-rhythm', icon: CalendarHeart, label: 'Klinik İçerikleri', roles: CONTENT },
    ],
  },
  {
    id: 'marketing',
    label: 'İçerik & Pazarlama',
    icon: Megaphone,
    roles: CONTENT,
    defaultOpen: true,
    items: [
      { href: '/admin/blog', icon: FileText, label: 'Blog', roles: CONTENT },
      { href: '/admin/blog/ai-writer', icon: Sparkles, label: 'AI Blog Asistanı', roles: CONTENT },
    ],
  },
  {
    id: 'system',
    label: 'Sistem Yönetimi',
    icon: Cog,
    roles: ['admin', 'manager'],
    defaultOpen: false,
    items: [
      { href: '/admin/users', icon: Users, label: 'Kullanıcılar', roles: ['admin'] },
      { href: '/admin/roles', icon: KeyRound, label: 'Yetki Yönetimi', roles: ['admin'] },
      { href: '/admin/settings', icon: Settings, label: 'Site Ayarları', roles: ['admin', 'manager'] },
      { href: '/admin/audit-logs', icon: Shield, label: 'İşlem Kayıtları', roles: ['admin', 'manager'] },
      { href: '/admin/maintenance', icon: Wrench, label: 'Bakım Modu', roles: ['admin'] },
    ],
  },
]

function findActiveHref(pathname: string): string | null {
  let best: string | null = null
  for (const group of navGroups) {
    for (const item of group.items) {
      const match = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
      if (match && (!best || item.href.length > best.length)) best = item.href
    }
  }
  return best
}

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [badges, setBadges] = useState<Record<string, number>>({})
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map(g => [g.id, g.defaultOpen]))
  )

  const activeHref = findActiveHref(pathname)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Yeni talep/mesaj sayaçları (yalnızca operasyon rolleri)
  useEffect(() => {
    const role = user?.role
    if (!role || !['admin', 'manager', 'reception'].includes(role)) return
    const loadBadges = async () => {
      const [dash, contact] = await Promise.all([
        adminApi.request<{ today_summary?: { new_requests: number } }>('/api/admin/dashboard'),
        adminApi.request<{ new: number }>('/api/admin/contact/messages/stats'),
      ])
      setBadges({
        '/admin/crm': dash.data?.today_summary?.new_requests || 0,
        '/admin/contact': contact.data?.new || 0,
      })
    }
    loadBadges()
    const interval = setInterval(loadBadges, 120000)
    return () => clearInterval(interval)
  }, [user?.role])

  useEffect(() => {
    if (!activeHref) return
    const group = navGroups.find(g => g.items.some(i => i.href === activeHref))
    if (group && !openGroups[group.id]) {
      setOpenGroups(prev => ({ ...prev, [group.id]: true }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHref])

  const handleLogout = async () => {
    await adminApi.logout()
    logout()
    router.push('/admin/login')
  }

  if (!mounted) return null

  const role = (user?.role || 'editor') as UserRole
  const visibleGroups = navGroups
    .filter(g => g.roles.includes(role))
    .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(role)) }))
    .filter(g => g.items.length > 0)

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    reception: 'bg-green-500/20 text-green-400 border-green-500/30',
    editor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    manager: 'Klinik Yöneticisi',
    reception: 'Resepsiyon',
    editor: 'İçerik Editörü',
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        data-testid="admin-mobile-menu-btn"
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
        data-testid="admin-sidebar"
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin" className="flex items-center justify-center">
            <Image
              src="/images/brand/logo.png"
              alt="WETNOSE Logo"
              width={180}
              height={72}
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 pt-4">
            <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border mt-0.5",
                  roleColors[user.role] || roleColors.editor
                )}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {visibleGroups.map((group) => {
            const isGroupOpen = openGroups[group.id]
            const GroupIcon = group.icon
            const hasActiveItem = group.items.some(i => i.href === activeHref)

            return (
              <div key={group.id}>
                <button
                  data-testid={`nav-group-${group.id}`}
                  onClick={() => setOpenGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
                    hasActiveItem ? "text-teal-400" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <GroupIcon className="w-4 h-4" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isGroupOpen ? "rotate-180" : "")} />
                </button>

                <AnimatePresence initial={false}>
                  {isGroupOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 space-y-0.5 pl-2">
                        {group.items.map((item) => {
                          const isActive = item.href === activeHref
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              data-testid={`nav-item-${item.href.replace(/\//g, '-').slice(1)}`}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                                isActive
                                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              )}
                            >
                              <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                              <span className="flex-1">{item.label}</span>
                              {(badges[item.href] || 0) > 0 && (
                                <span data-testid={`nav-badge-${item.href.replace(/\//g, '-').slice(1)}`}
                                  className="min-w-[20px] h-5 px-1.5 rounded-full bg-teal-500 text-white text-[11px] font-semibold flex items-center justify-center">
                                  {badges[item.href]}
                                </span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            data-testid="admin-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  )
}
