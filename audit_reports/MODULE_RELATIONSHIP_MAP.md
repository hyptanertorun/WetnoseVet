# MODULE RELATIONSHIP MAP — Modüller Arası İlişki ve Veri Akışı

## MEVCUT İLİŞKİ HARİTASI
```
                    ┌──────────────┐
 Frontend form ───▶ │ Randevu (CRM)│──▶ Takip (follow_up_at) ✅
                    │  lead_score  │──▶ Notlar, atama, durum pipeline ✅
                    └──────────────┘
                          ✗ bağ yok
                    ┌──────────────┐
 Frontend form ───▶ │   Mesajlar   │  (okundu/yanıtlandı/arşiv — çıkmaz sokak)
                    └──────────────┘

 ┌──────────┐   service_id ✅   ┌──────────┐
 │ Yorumlar │ ────────────────▶ │ Hizmetler│ ◀── Slider CTA (href) ✅
 └──────────┘                   └──────────┘
                                   ▲   ▲
                        ✗ bağ yok  │   │  ✗ bağ yok
                            ┌──────┘   └──────┐
                       ┌────────┐        ┌────────┐
                       │  Blog  │        │  Ekip  │ (specialties = serbest metin)
                       └────────┘        └────────┘

 ┌──────────┐    Header(masaüstü), Footer, EmergencySection ✅
 │ Ayarlar  │ ─▶
 └──────────┘    ✗ WhatsappButton, Header(mobil), ContactForm,
                   /iletisim, /randevu, /hakkimizda → statik siteData.ts (ÇELİŞKİ!)
```

## MISSING INTEGRATIONS (öncelik sırasıyla)

### 1. Mesaj → Randevu Talebine Dönüştür (YÜKSEK — günlük operasyon)
- **Akış:** Mesaj detayında "Randevuya Dönüştür" → CRM'de yeni Appointment (name/email/phone/message otomatik taşınır, source: 'contact_message', mesaj `converted` durumuna geçer, karşılıklı referans tutulur).
- **DB:** `contact_messages.converted_appointment_id` + `appointments.source_message_id` (yeni opsiyonel alanlar — geriye uyumlu).
- **Aksiyon seti eşitleme:** Mesaj satırına Ara + WhatsApp butonları da eklenir (CRM ile aynı davranış).

### 2. Ayarlar → Tüm Frontend (Tek Veri Kaynağı) (YÜKSEK — veri bütünlüğü)
- `siteData.ts`'teki iletişim alanları kaldırılır; tüm bileşenler DB settings'ten beslenir (mevcut `/api/public/settings` + no-store).
- Etkilenen 7 nokta: WhatsappButton, Header (mobil), ContactForm, /iletisim, /randevu, /hakkimizda, Footer fallback'leri.
- **ÖN KOŞUL: Doğru telefon/WhatsApp numaralarının kullanıcı tarafından onaylanması.**

### 3. Blog ↔ Hizmet (ORTA — SEO + iç bağlantı değeri)
- **DB:** `blog_posts.related_service_ids: string[]` (opsiyonel, geriye uyumlu).
- **Panel:** Blog editöründe hizmet seçici (çoklu).
- **Frontend:** Hizmet detayında "İlgili Yazılar" bölümü; blog detayında "İlgili Hizmet" kartı (CTA → randevu).

### 4. Ekip ↔ Hizmet (ORTA)
- **DB:** `team_members.service_ids: string[]` (specialties korunur, ek alan).
- **Panel:** Ekip formunda hizmet çoklu seçici.
- **Frontend:** Hizmet detayında "Bu Hizmeti Veren Uzmanlar".

### 5. Randevu → Otomatik Takip (DÜŞÜK — CRM zaten manuel takip destekliyor)
- Durum `contacted` olup 48 saat işlem görmeyen talepler dashboard'da "geciken" olarak zaten yükseliyor. Ek otomasyon: reddedilen/ertelenen talepte takip tarihi önerisi (form içi varsayılan) — hafif dokunuş yeterli.

### 6. Galeri ↔ Hizmet (DÜŞÜK — iş değeri sınırlı, ertelenebilir)

## TEK VERİ KAYNAKLARI (hedef durum)
| Veri | Tek kaynak | Tüketiciler |
|---|---|---|
| Telefon, WhatsApp, adres, e-posta, saatler, acil hat, sosyal medya | DB `settings` (panel > Ayarlar) | Header, Footer, WhatsappButton, ContactForm, iletisim, randevu, hakkimizda, EmergencySection, JSON-LD schema |
| Hizmet listesi | DB `services` | Ana sayfa carousel, /hizmetler, randevu formu hizmet seçimi, footer linkleri |
| Ekip | DB `team_members` | /ekibimiz, ana sayfa, (yeni) hizmet detay |
| Yorumlar | DB `testimonials` (approved) | Ana sayfa, (yeni) hizmet detay |

## OTOMASYON FIRSATLARI (backlog)
- Mesaj yanıtlandığında otomatik "yanıtlandı" işaretleme + takip önerisi
- Randevu tamamlandığında geri bildirim isteme (feedback_sent alanı modelde zaten mevcut!)
- Yayında olup görseli eksik içerik için sistem sağlığı uyarısı
