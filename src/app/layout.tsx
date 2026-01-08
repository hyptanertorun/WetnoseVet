import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ScrollProgress'

const BASE_URL = 'https://www.wetnose.com.tr'

// Font optimization - self-hosted with swap
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  // Only load weights we actually use
  weight: ['400', '500', '600', '700'],
})

// Viewport configuration for better mobile experience
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#030712',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'WETNOSE | Veteriner Kliniği',
    template: '%s | Wetnose'
  },
  description: 'Dostlarımıza çok fazla değer veriyoruz. Modern teknoloji ile veteriner hizmetleri.',
  keywords: ['veteriner', 'klinik', 'kedi', 'köpek', 'evcil hayvan', 'İstanbul'],
  authors: [{ name: 'Wetnose Veteriner Kliniği' }],
  creator: 'Wetnose',
  publisher: 'Wetnose Veteriner Kliniği',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'Wetnose Veteriner Kliniği',
    title: 'WETNOSE | Veteriner Kliniği',
    description: 'Dostlarımıza çok fazla değer veriyoruz. Modern teknoloji ile veteriner hizmetleri.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Wetnose Veteriner Kliniği',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WETNOSE | Veteriner Kliniği',
    description: 'Dostlarımıza çok fazla değer veriyoruz. Modern teknoloji ile veteriner hizmetleri.',
    images: ['/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://wetnose.com.tr/#organization",
        "name": "Wetnose Veteriner Kliniği",
        "url": "https://wetnose.com.tr",
        "logo": {
          "@type": "ImageObject",
          "url": "/images/brand/logo.png"
        },
        "sameAs": [
          "https://www.instagram.com/wetnoseveteriner/"
        ]
      },
      {
        "@type": "VeterinaryCare",
        "@id": "https://wetnose.com.tr/#veterinaryclinic",
        "name": "Wetnose Veteriner Kliniği",
        "image": "/images/brand/logo.png",
        "url": "https://wetnose.com.tr",
        "telephone": "+90 553 484 54 24",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Kadıköy Mah. Atatürk Bulvarı Atatürk Ortaokulu Karşısı",
          "addressLocality": "İzmit",
          "addressRegion": "Kocaeli",
          "addressCountry": "TR"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "20:00"
          }
        ],
        "priceRange": "$$",
        "servesCuisine": "Veteriner Hizmetleri"
      },
      {
        "@type": "WebSite",
        "@id": "https://wetnose.com.tr/#website",
        "url": "https://wetnose.com.tr",
        "name": "Wetnose Veteriner Kliniği",
        "publisher": {
          "@id": "https://wetnose.com.tr/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://wetnose.com.tr/saglik-rehberi?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }

  return (
    <html lang="tr" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-[#030712] relative`}>
        <ScrollProgress />
        {children}
      </body>
    </html>
  )
}
