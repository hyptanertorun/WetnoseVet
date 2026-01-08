# WETNOSE Veteriner Kliniği - Premium Website

Modern, fütüristik ve Apple/Tesla tarzında tasarlanmış veteriner kliniği web sitesi.

## 🚀 Özellikler

- **Hero Slider**: 3 slaytlı, parallax efektli slider
- **Scroll Deneyimi**: GSAP ScrollTrigger ile pinned section, 3D kedi modeli ve organ overlay
- **Hizmetler Carousel**: Netflix tarzı yatay scroll carousel
- **Ekip Bölümü**: Hover efektli ekip kartları
- **Foto Galeri**: Masonry layout ve lightbox
- **İletişim**: Form, WhatsApp CTA ve harita
- **Mobil Uyumlu**: Tüm ekran boyutlarına responsive

## 🛠️ Teknolojiler

- Next.js 14
- TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger
- Framer Motion
- Lucide Icons

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── globals.css      # Global stiller
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Ana sayfa
├── components/
│   ├── Header.tsx       # Navigasyon
│   ├── HeroSlider.tsx   # Ana slider
│   ├── ScrollExperience.tsx  # Scroll deneyimi
│   ├── OrganOverlay.tsx # Organ görseli
│   ├── HUD.tsx          # Sağlık verileri
│   ├── ServicesCarousel.tsx  # Hizmetler
│   ├── Team.tsx         # Ekip
│   ├── Gallery.tsx      # Galeri
│   ├── ContactForm.tsx  # İletişim
│   └── Footer.tsx       # Alt kısım
├── data/
│   └── siteData.ts      # Tüm site verileri
└── lib/
    └── utils.ts         # Yardımcı fonksiyonlar
```

## 🖼️ Slider Görsellerini Değiştirme

1. `/public/slider/` klasöründeki dosyaları değiştirin:
   - `slider-1.jpg`
   - `slider-2.jpg`
   - `slider-3.jpg`

2. Önerilen boyut: **1920x1080px** veya **16:9** en-boy oranı

3. Slider başlıklarını değiştirmek için `/src/data/siteData.ts` dosyasındaki `heroSlides` array'ini düzenleyin.

## 🎨 Tema Konfigürasyonu

Renk paleti ve temel stiller `/tailwind.config.ts` dosyasında tanımlıdır:

```typescript
colors: {
  medical: {
    blue: '#00d4ff',    // Ana vurgu rengi
    teal: '#00b4d8',    // İkincil vurgu
    glow: 'rgba(0, 212, 255, 0.3)', // Glow efektleri
  },
  // ... diğer renkler
}
```

## 🔧 3D Model Değiştirme

Mevcut kedi modeli SVG tabanlıdır. Gerçek 3D model eklemek için:

1. Spline kullanarak: `@splinetool/react-spline` paketi zaten yüklü
2. `/src/components/ScrollExperience.tsx` dosyasındaki kedi SVG'sini Spline komponenti ile değiştirin

```tsx
import Spline from '@splinetool/react-spline'

<Spline scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode" />
```

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## ⚡ Performans İpuçları

- 3D toggle butonu ile düşük performanslı cihazlarda 3D'yi kapatın
- `prefers-reduced-motion` desteği ile animasyonlar otomatik devre dışı kalır
- Görseller lazy-load edilir

## 🚀 Çalıştırma

```bash
cd frontend
yarn install
yarn dev
```

Site http://localhost:3000 adresinde çalışacaktır.
