# Wetnose Veteriner Kliniği - PRD (Product Requirements Document)

## Orijinal Problem
React frontend + FastAPI backend projesinin full-stack Next.js uygulamasına geçirilmesi. Ana hedefler:
- `hyptanertorun/WetnoseVet` repository'sinden frontend'in yeniden kullanılması
- Tüm FastAPI mantığının Next.js Route Handler'larına dönüştürülmesi
- Mevcut MongoDB veritabanı ile uyumluluk

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Backend**: Next.js API Route Handlers
- **Database**: MongoDB
- **Auth**: JWT (JSON Web Tokens)
- **UI**: Tailwind CSS, Shadcn/UI components

## Kullanıcı Gereksinimleri

### P0 - Kritik (Tamamlandı)
- [x] Admin Login çalışmalı
- [x] Admin Panel CRUD işlemleri (kaydet butonları) çalışmalı
  - [x] /admin/settings - Ayarlar kaydetme
  - [x] /admin/services - Hizmet ekleme/güncelleme/silme
  - [x] /admin/team - Ekip üyesi ekleme/güncelleme/silme
  - [x] /admin/gallery - Galeri yönetimi
  - [x] /admin/roles - Rol yönetimi
- [x] Preview URL'de API çalışmalı

### P1 - Önemli (Tamamlandı)
- [x] Veri çekme: izmitacilveteriner.com'dan ekip, hizmetler, galeri
- [x] Ana sayfa dinamik içerik (Services Carousel vb.)
- [x] HTTP 520 hatası çözüldü

### P2 - İyileştirmeler (Backlog)
- [ ] AI destekli blog yazımı
- [ ] Gelişmiş analitikler
- [ ] Performance optimizasyonları

## Tamamlanan İşler (15 Ocak 2026)

### Backend API
- Settings CRUD: GET/PUT /api/admin/settings ✅
- Services CRUD: GET/POST/PUT/DELETE /api/admin/services ✅
- Team Members CRUD: GET/POST/PUT/DELETE /api/admin/team-members ✅
- Gallery CRUD: GET/POST/PUT/DELETE /api/admin/gallery ✅
- Roles: GET /api/admin/roles/permissions ✅
- Backward compatibility routes for gallery ✅

### Frontend
- Admin Login sayfası ✅
- Dashboard ✅
- Settings sayfası (form + kaydet) ✅
- Services sayfası (liste + CRUD) ✅
- Team sayfası (liste + CRUD) ✅
- Gallery sayfası ✅
- Roles sayfası ✅

### Test Sonuçları
- Backend: 87.5% (14/16 test)
- Frontend: 100% (tüm sayfalar)
- Kritik hata: YOK

## Kod Mimarisi
```
/app
├── src/
│   ├── app/
│   │   ├── api/admin/       # Admin API routes
│   │   ├── admin/           # Admin panel pages
│   │   └── (main_site)/     # Public pages
│   ├── components/          # React components
│   ├── lib/
│   │   ├── services/        # Business logic
│   │   └── db/              # MongoDB connection
│   └── middleware/          # Auth middleware
├── public/images/           # Static images
├── tests/                   # Test files
└── test_reports/            # Test results
```

## Admin Credentials
- Email: admin@wetnose.com.tr
- Password: WetnoseStage2026!

## Preview URL
https://vetclinic-next.preview.emergentagent.com
