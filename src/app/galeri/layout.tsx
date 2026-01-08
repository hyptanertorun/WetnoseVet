import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foto Galeri | Wetnose Veteriner Kliniği',
  description: 'Wetnose Veteriner Kliniği\'nin modern tesisleri, deneyimli ekibi ve mutlu hayvan dostlarından fotoğraflar.',
  openGraph: {
    title: 'Foto Galeri | Wetnose Veteriner Kliniği',
    description: 'Modern tesislerimiz ve mutlu dostlarımızdan kareler.',
    type: 'website',
    locale: 'tr_TR',
    images: [
      {
        url: '/images/blog-og-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Wetnose Veteriner - Foto Galeri',
      },
    ],
  },
  alternates: {
    canonical: '/galeri',
  },
}

export default function GaleriLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
