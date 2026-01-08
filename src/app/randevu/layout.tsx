import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetnose.com.tr'

export const metadata: Metadata = {
  title: 'Online Randevu Al',
  description: 'Wetnose Veteriner Kliniği\'nden hızlı ve kolay online randevu alın. Patili dostunuz için en uygun zamanı seçin.',
  keywords: ['veteriner randevu', 'online randevu', 'veteriner rezervasyon', 'acil randevu'],
  openGraph: {
    title: 'Online Randevu Al',
    description: 'Wetnose Veteriner Kliniği\'nden hızlı ve kolay online randevu alın.',
    type: 'website',
    locale: 'tr_TR',
    url: `${BASE_URL}/randevu`,
    siteName: 'Wetnose Veteriner Kliniği',
  },
  alternates: {
    canonical: `${BASE_URL}/randevu`,
  },
}

export default function RandevuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
