import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetnose.com.tr'

export const metadata: Metadata = {
  title: 'Uzman Veteriner Ekibimiz',
  description: 'Deneyimli ve uzman veteriner hekim kadromuzla tanışın. Her biri alanında uzmanlaşmış profesyonellerden oluşan ekibimiz.',
  keywords: ['veteriner hekim', 'uzman veteriner', 'veteriner ekibi', 'İstanbul veteriner'],
  openGraph: {
    title: 'Uzman Veteriner Ekibimiz',
    description: 'Deneyimli ve uzman veteriner hekim kadromuzla tanışın.',
    type: 'website',
    locale: 'tr_TR',
    url: `${BASE_URL}/ekibimiz`,
    siteName: 'Wetnose Veteriner Kliniği',
  },
  alternates: {
    canonical: `${BASE_URL}/ekibimiz`,
  },
}

export default function EkibimizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
