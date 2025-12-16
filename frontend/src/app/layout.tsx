import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WETNOSE | Veteriner Kliniği',
  description: 'Dostlarımıza çok fazla değer veriyoruz. Modern teknoloji ile veteriner hizmetleri.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <script src="https://assets.emergent.sh/scripts/emergent-main.js" defer></script>
      </head>
      <body className="antialiased">
        {children}
        {/* Emergent Badge */}
        <a
          id="emergent-badge"
          target="_blank"
          href="https://app.emergent.sh/?utm_source=emergent-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            textDecoration: 'none',
            padding: '6px 10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <img
              style={{ width: '20px', height: '20px', marginRight: '8px' }}
              src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
              alt="Emergent"
            />
            <p style={{ color: '#000000', fontSize: '12px', margin: 0 }}>
              Made with Emergent
            </p>
          </div>
        </a>
      </body>
    </html>
  )
}
