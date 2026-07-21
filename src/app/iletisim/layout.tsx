import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İletişim | Wetnose Veteriner Kliniği',
  description:
    'Wetnose Veteriner Kliniği iletişim bilgileri: adres, telefon, WhatsApp ve çalışma saatleri. İzmit Kocaeli veteriner kliniği ile hemen iletişime geçin.',
  alternates: { canonical: '/iletisim' },
  openGraph: {
    title: 'İletişim | Wetnose Veteriner Kliniği',
    description: 'Adres, telefon, WhatsApp ve çalışma saatlerimiz. Hemen iletişime geçin.',
  },
}

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children
}
