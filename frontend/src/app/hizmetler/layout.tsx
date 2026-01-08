import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetnose.com.tr'

export const metadata: Metadata = {
  title: 'Veteriner Hizmetlerimiz',
  description: 'Modern veteriner hizmetleri: Genel muayene, cerrahi operasyonlar, aşılama, acil servis ve daha fazlası. Patili dostlarınız için en iyi bakım.',
  keywords: ['veteriner hizmetleri', 'kedi muayene', 'köpek aşı', 'cerrahi', 'acil veteriner'],
  openGraph: {
    title: 'Veteriner Hizmetlerimiz | Wetnose',
    description: 'Modern veteriner hizmetleri: Genel muayene, cerrahi operasyonlar, aşılama, acil servis ve daha fazlası.',
    type: 'website',
    locale: 'tr_TR',
    url: `${BASE_URL}/hizmetler`,
    siteName: 'Wetnose Veteriner Kliniği',
  },
  alternates: {
    canonical: `${BASE_URL}/hizmetler`,
  },
}

export default function HizmetlerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
