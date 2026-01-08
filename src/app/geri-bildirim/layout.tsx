import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetnose.com.tr'

export const metadata: Metadata = {
  title: 'Ne Kadar Memnun Edebildik?',
  description: 'Deneyiminizi bizimle paylaşın. Geri bildirimleriniz hizmet kalitemizi sürekli iyileştirmemize yardımcı olur.',
  openGraph: {
    title: 'Ne Kadar Memnun Edebildik?',
    description: 'Deneyiminizi bizimle paylaşın. Geri bildirimleriniz hizmet kalitemizi sürekli iyileştirmemize yardımcı olur.',
    type: 'website',
    locale: 'tr_TR',
    url: `${BASE_URL}/geri-bildirim`,
    siteName: 'Wetnose Veteriner Kliniği',
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${BASE_URL}/geri-bildirim`,
  },
}

export default function GeriBildirimLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
