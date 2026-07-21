# PANEL ↔ FRONTEND SYNC MAP

## VERİ HARİTASI (modül → frontend görünümü → senkron durumu)

| Panel Modülü | Yönetilen Veri | Frontend'de Göründüğü Yer | Senkron | Not |
|---|---|---|---|---|
| Hizmetler | ad, açıklama, görsel, fiyat, SEO | Ana sayfa carousel, /hizmetler, /hizmetler/[slug], sitemap | ✅ ANLIK | force-dynamic + no-store (önceki denetimde düzeltildi, test edildi) |
| Ekip | isim, uzmanlık, foto, bio | /ekibimiz, /ekibimiz/[slug], ana sayfa | ✅ ANLIK | " |
| Blog | yazı, kategori, görsel, SEO | /saglik-rehberi, detay, sitemap | ✅ ANLIK | Sitemap DB-direkt (düzeltildi) |
| Slider | görsel, başlık, CTA, sıra | Ana sayfa hero | ✅ ANLIK | is_active=false anında kalkar |
| Galeri | albüm, görseller | /galeri, ana sayfa galeri şeridi | ✅ ANLIK | |
| Yorumlar | onaylı yorumlar | Ana sayfa yorumlar bölümü | ✅ ANLIK | Yalnızca approved + consent_public görünür |
| Klinik Ritmi | günün sorusu | Ana sayfa "Klinik Ritmi" bölümü | ✅ ANLIK | 60 günlük döngü, date_key unique index |
| Ayarlar | tel, adres, saat, sosyal | Header(masaüstü), Footer, EmergencySection, schema | ⚠️ **YARIM** | Aşağıdaki 7 nokta statik dosyadan besleniyor |
| Bakım Modu | site kapatma | /bakim yönlendirmesi | ⚠️ **ZAYIF** | middleware devre dışı; yalnızca client-side kontrol |
| Kullanıcılar/Yetkiler/Audit | — | (frontend'e yansımaz) | — | |

## EKSİK BAĞLANTILAR (statik hardcode listesi)
`src/data/siteData.ts` → panelden YÖNETİLEMEYEN, DB ile ÇELİŞEN iletişim verisi:

| Bileşen/Sayfa | Kullandığı statik alan | Risk |
|---|---|---|
| `WhatsappButton.tsx` (sitenin ana CTA'sı!) | `siteInfo.whatsapp` + hardcoded fallback `905534845424` | Panelden WhatsApp değişse bile buton ESKİ numaraya açılır |
| `Header.tsx` mobil menü (satır 186-190) | `siteInfo.phone` | Mobil kullanıcı farklı numara görür (masaüstü DB'den!) |
| `ContactForm.tsx` | `siteInfo.phone` | |
| `/iletisim` sayfası | `siteInfo.*` (tamamı) | İletişim sayfası panel Ayarlar'dan bağımsız |
| `/randevu` sayfası | `siteInfo.*` | |
| `/hakkimizda` sayfası | `siteInfo.*` | |
| `Footer.tsx` | `settings ?? siteInfo` fallback | Fallback farklı numara gösterebilir |

**Somut çelişki (bugün canlıda):** Masaüstü header `0262 321 33 53` (DB) gösterirken, WhatsApp butonu `0553 484 54 24`'e (statik) mesaj açıyor.

## CACHE & INVALIDATION DAVRANIŞI (mevcut — doğrulanmış)
- Tüm API route'ları: `force-dynamic` → her istekte DB'den okunur
- Server-side sayfa fetch'leri: `cache: 'no-store'`
- Client bileşenleri (Header/Footer/ana sayfa bölümleri): mount'ta fetch → sayfa yenilendiğinde güncel
- Upload görselleri: immutable cache (UUID dosya adı — doğru strateji)
- **Sonuç:** Panel değişikliği → frontend yansıması testle doğrulandı (iteration_4). Kalan tek senkron riski statik siteData kullanımı.

## YAYIN DURUMU → FRONTEND DAVRANIŞI
| Durum | Hizmet/Ekip/Blog | Slider/Galeri | Yorum |
|---|---|---|---|
| Taslak (draft) | Frontend'de görünmez ✅ | — | pending: görünmez ✅ |
| Yayında (published) | Görünür ✅ | is_active=true: görünür ✅ | approved+consent: görünür ✅ |
| Arşiv (archived) | Görünmez, geri yüklenebilir ✅ | is_active=false | archived: görünmez ✅ |
- Silme yerine arşivleme tüm içerik modüllerinde uygulanıyor ✅
- UI dili tutarsız (bazı yerde "Aktif", bazı yerde "Yayında") → Faz'da ortak dil: **Taslak / Yayında / Arşiv**

## FRONTEND SYNC RISKS
1. **siteData statik verisi** (yukarıdaki 7 nokta) — tek gerçek risk, Faz 3'te çözülecek
2. Bakım modu middleware'siz — bakım açılsa da API'ler ve doğrudan URL'ler açık kalır (Sistem grubunda uyarı gösterilecek)
3. JSON-LD schema'daki telefon — settings'ten mi statikten mi geldiği Faz 3'te doğrulanacak
