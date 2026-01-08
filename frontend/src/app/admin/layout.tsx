import type { Metadata } from 'next'
import AdminLayoutContent from './components/AdminLayoutContent'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  title: 'Admin Panel | Wetnose',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>
}
