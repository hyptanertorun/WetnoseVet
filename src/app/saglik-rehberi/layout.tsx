import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Evcil Hayvan Sağlık Rehberi | Wetnose',
  description: 'Kedi ve köpekler için güvenilir sağlık bilgileri, aşı rehberleri ve bakım ipuçları.',
  openGraph: {
    title: 'Evcil Hayvan Sağlık Rehberi | Wetnose',
    description: 'Kedi ve köpekler için güvenilir sağlık bilgileri, aşı rehberleri ve bakım ipuçları.',
    type: 'website',
    locale: 'tr_TR',
    images: [
      {
        url: '/images/blog-og-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Wetnose Veteriner - Evcil Hayvan Sağlık Rehberi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evcil Hayvan Sağlık Rehberi | Wetnose',
    description: 'Kedi ve köpekler için güvenilir sağlık bilgileri, aşı rehberleri ve bakım ipuçları.',
    images: ['/images/blog-og-cover.jpg'],
  },
  alternates: {
    canonical: '/saglik-rehberi',
  },
}

export default function SaglikRehberiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
