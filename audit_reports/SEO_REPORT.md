# SEO REPORT — Wetnose Veteriner Kliniği

## Düzeltilenler
1. ✅ **Statik/bayat sitemap.xml** (`public/sitemap.xml`, lastmod 2025-12-28) dinamik `app/sitemap.ts`'i gölgeliyordu → silindi. Sitemap artık MongoDB'den yayındaki blog yazılarını otomatik içeriyor (**12 URL**: 8 statik sayfa + 4 blog).
2. ✅ **sitemap.ts kırıktı:** Boş `NEXT_PUBLIC_BACKEND_URL` ile fetch yapıyordu (blog URL'leri hiç eklenmiyordu) → artık doğrudan DB sorgusu.
3. ✅ **/iletisim sayfasında metadata yoktu** → title, description, canonical, OpenGraph eklendi.

## Mevcut Durum (doğrulandı)
| Öğe | Durum |
|---|---|
| Sayfa bazlı title/description | ✅ Tüm public sayfalarda (layout/generateMetadata) |
| Dinamik metadata (hizmet/ekip/blog detay) | ✅ `generateMetadata` ile slug bazlı |
| Tek H1 / hiyerarşik H2 | ✅ Ana sayfada 1 H1, 5 H2 |
| JSON-LD Structured Data | ✅ 2 blok: Organization + VeterinaryCare graph |
| OpenGraph + Twitter Cards | ✅ Root layout'ta tanımlı |
| robots.txt | ✅ Dinamik; /admin, /api/admin, /geri-bildirim engelli |
| Görsel alt metinleri | ✅ Ana sayfadaki tüm img'lerde alt var |
| Canonical | ✅ metadataBase + alternates |
| 404 sayfası | ✅ Doğru 404 status dönüyor |
| Türkçe URL yapısı | ✅ /hizmetler, /ekibimiz, /saglik-rehberi (yerel SEO dostu) |

## Yerel SEO (Local SEO)
- ✅ Adres, telefon, çalışma saatleri admin panelden yönetiliyor ve sitede gösteriliyor.
- ✅ VeterinaryCare/Organization schema mevcut.
- ⚠️ **NAP TUTARSIZLIĞI (YÜKSEK — kullanıcı onayı gerekli):**
  - Statik veri (`src/data/siteData.ts`, iletisim/randevu/footer bazı yerlerde): tel `0553 484 54 24`, WhatsApp `90553 484 54 24`
  - Admin ayarları (DB): tel `0262 321 33 53`, WhatsApp `0544 938 66 73`
  - Google, tutarsız NAP'i (Name-Address-Phone) yerel sıralamada cezalandırır. **Hangi numaraların doğru olduğu onaylanmalı**, ardından tüm site tek kaynaktan (DB settings) beslenmeli.
- 🔸 Öneri: Google Business Profile bağlantısı ve `hasMap`/`geo` alanlarının schema'ya eklenmesi (düşük efor, yüksek yerel görünürlük etkisi).

## Öneriler (deploy sonrası)
1. `NEXT_PUBLIC_SITE_URL` env'ini production domain'iyle ayarlayın (şu an fallback: www.wetnose.com.tr — doğruysa sorun yok).
2. Deploy sonrası Google Search Console'a sitemap gönderin.
3. Blog yazılarına FAQ schema eklemek (veriler zaten DB'de mevcut) zengin sonuç şansını artırır.

## Sonuç: SEO altyapısı production'a HAZIR (NAP onayı hariç).
