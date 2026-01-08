import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetnose.com.tr'

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'Wetnose Veteriner Kliniği olarak patili dostlarınıza en iyi bakımı sunuyoruz. Misyonumuz, vizyonumuz ve değerlerimiz.',
  keywords: ['wetnose', 'veteriner kliniği', 'hakkımızda', 'kurumsal'],
  openGraph: {
    title: 'Hakkımızda',
    description: 'Wetnose Veteriner Kliniği olarak patili dostlarınıza en iyi bakımı sunuyoruz.',
    type: 'website',
    locale: 'tr_TR',
    url: `${BASE_URL}/hakkimizda`,
    siteName: 'Wetnose Veteriner Kliniği',
  },
  alternates: {
    canonical: `${BASE_URL}/hakkimizda`,
  },
}

export default function HakkimizdaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
