import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetnose.com.tr'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/hizmetler',
          '/hizmetler/*',
          '/ekibimiz',
          '/ekibimiz/*',
          '/hakkimizda',
          '/randevu',
          '/galeri',
          '/iletisim',
          '/saglik-rehberi',
          '/saglik-rehberi/*',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/admin',
          '/api/admin/*',
          '/geri-bildirim',
          '/preview',
          '/preview/*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
