# DATABASE REPORT — Wetnose Veteriner Kliniği (MongoDB: wetnose_db)

## Koleksiyon Envanteri (denetim sonrası)
| Koleksiyon | Kayıt | Durum |
|---|---|---|
| services | 18 | ✅ Temiz (3 QA test kaydı silindi) |
| team_members | 10 | ✅ Temiz (3 QA test kaydı silindi, isim düzeltildi) |
| blog_posts | 5 | ✅ |
| clinic_rhythm | 60 | ✅ 60 günlük döngü verisi tam |
| gallery_albums / gallery_items | 2 / 12 | ✅ |
| slides / slider_settings | 3 / 1 | ✅ |
| testimonials | 3 | ✅ |
| settings | 1 | ✅ |
| users | 1 | ✅ (admin) |
| refresh_tokens | 0 | ✅ 94 süresi dolmuş token temizlendi, TTL aktif |
| audit_logs | 122+ | ✅ index eklendi |
| contact_messages | 2 | ✅ |

## Yapılan Düzeltmeler
### 1. Index'ler (hiç yoktu → 18 eklendi)
```
users:           {email:1} UNIQUE, {id:1} UNIQUE
services:        {slug:1} UNIQUE, {status:1, sort_order:1}
team_members:    {slug:1}, {status:1, sort_order:1}
blog_posts:      {slug:1} UNIQUE, {status:1, published_at:-1}
clinic_rhythm:   {date_key:1} UNIQUE
refresh_tokens:  {token:1}, {user_id:1}, {expires_at:1} TTL (otomatik silme)
gallery_items:   {album_id:1}
audit_logs:      {created_at:-1}
slides:          {sort_order:1}
testimonials:    {status:1}
contact_messages:{created_at:-1}
```
**Etki:** Slug/login sorguları artık collection scan yapmıyor; süresi dolmuş refresh token'lar MongoDB tarafından otomatik siliniyor; slug ve email çakışmaları DB seviyesinde engelli.

### 2. Veri Bütünlüğü Temizliği
- `services`: "Güncellenmiş Hizmet Başlığı" → **"Laboratuvar"** düzeltildi; `test-hizmet`, `qa_test_hizmet`, `qa_test` silindi.
- `team_members`: "Güncellenmiş Üye İsmi" → **"Hasan Murat TÜRKAN"** düzeltildi (bio dahil); `test-uye`, `qa_test_uye`, `qa_test` silindi.
- `refresh_tokens`: 94 süresi dolmuş kayıt silindi.

## Veri Modeli Değerlendirmesi
- ✅ Uygulama seviyesinde UUID `id` alanı kullanılıyor (Mongo `_id`'den bağımsız) — doğru pratik.
- ✅ Soft-delete (archive) modeli services/team'de tutarlı uygulanmış.
- ⚠️ **Bilinen davranış:** Arşivlenmiş kayıt slug'ı rezerve tutar; aynı slug ile yeni kayıt E11000 hatası verir (500 döner). Öneri: 409 + açıklayıcı mesaj (PRIORITY_ROADMAP'te, düşük öncelik).
- ⚠️ `audit_logs` sınırsız büyür. Öneri: 6-12 aylık TTL veya capped collection (düşük öncelik).

## Sonuç: Veritabanı production'a HAZIR.
