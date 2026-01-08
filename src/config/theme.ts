// Theme Configuration - WETNOSE Veteriner Kliniği
// Bu dosyayı düzenleyerek site genelindeki renkleri ve stilleri değiştirebilirsiniz

export const theme = {
  // Renkler
  colors: {
    // Ana renkler
    primary: {
      main: '#00d4ff',      // Medical blue
      light: '#4de8ff',
      dark: '#0099cc',
    },
    secondary: {
      main: '#00b4d8',      // Medical teal
      light: '#4dcfe8',
      dark: '#0077b6',
    },
    // Arka plan renkleri
    background: {
      light: '#ffffff',
      gray: '#f8fafc',
      dark: '#0f172a',
    },
    // Metin renkleri
    text: {
      primary: '#1a1a1a',
      secondary: '#6b7280',
      light: '#9ca3af',
      white: '#ffffff',
    },
    // Durum renkleri
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    // WhatsApp
    whatsapp: '#25D366',
  },

  // Yazı tipleri
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "'SF Pro Display', 'Inter', sans-serif",
    },
    sizes: {
      hero: {
        mobile: '2.5rem',   // 40px
        tablet: '3rem',     // 48px
        desktop: '3.75rem', // 60px
      },
      h1: {
        mobile: '2rem',     // 32px
        desktop: '3rem',    // 48px
      },
      h2: {
        mobile: '1.5rem',   // 24px
        desktop: '2rem',    // 32px
      },
      body: '1rem',         // 16px
      small: '0.875rem',    // 14px
    },
  },

  // Boşluklar
  spacing: {
    section: {
      mobile: '4rem',       // 64px
      desktop: '6rem',      // 96px
    },
    container: {
      mobile: '1rem',       // 16px
      desktop: '2rem',      // 32px
    },
  },

  // Köşe yuvarlaklıkları
  borderRadius: {
    small: '0.5rem',        // 8px
    medium: '1rem',         // 16px
    large: '1.5rem',        // 24px
    full: '9999px',
  },

  // Gölgeler
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
    large: '0 8px 32px rgba(0, 0, 0, 0.15)',
    glow: '0 0 20px rgba(0, 212, 255, 0.3)',
  },

  // Animasyon süreleri
  animation: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
  },

  // Z-index katmanları
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 300,
    tooltip: 400,
  },
};

export default theme;
