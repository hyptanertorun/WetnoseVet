# ADMIN INFORMATION ARCHITECTURE — Önerilen Yeni Yapı

## RECOMMENDED NEW MENU

```
📌 GÜNLÜK OPERASYON                    (varsayılan açık — her rol için giriş noktası)
   ├── Bugün (Dashboard)               [tüm roller]
   ├── Randevu Talepleri  (n)          [admin, manager, reception]
   └── Mesajlar  (n)                   [admin, manager, reception]

🌐 WEB SİTESİ                          (collapsible grup)
   ├── Hizmetler                       [admin, manager, editor]
   ├── Ekip                            [admin, manager, editor]
   ├── Ana Sayfa & Slider              [admin, manager, editor]
   ├── Galeri                          [admin, manager, editor]
   ├── Yorumlar  (onay bekleyen n)     [admin, manager, editor]
   └── Günün Sorusu (Klinik Ritmi)     [admin, manager, editor]

✍️ İÇERİK & PAZARLAMA                  (collapsible grup)
   └── Blog  (+ AI Yazar sekmesi)      [admin, manager, editor]

⚙️ SİSTEM                              (collapsible, varsayılan KAPALI — sadece yetkili)
   ├── Kullanıcılar                    [admin]
   ├── Yetki Yönetimi                  [admin]
   ├── İşlem Kayıtları (Audit)         [admin, manager]
   ├── Site Ayarları                   [admin, manager]
   └── Bakım Modu                      [admin]
```

### Gerekçeler
1. **AI Blog Writer ana menüden kalkıyor** → Blog sayfasının içinde "AI ile Yaz" birincil butonu/sekmesi olur. Kod zaten entegre (üretim sonrası blog editörüne yönlendiriyor); menü ayrımı yapay bir "iki sistem" algısı üretiyordu. Mevcut `/admin/blog/ai-writer` route'u korunur (kırık link olmaz).
2. **Klinik Ritmi → "Günün Sorusu" adıyla Web Sitesi grubuna** → Modül aslında ana sayfadaki günlük soru-cevap İÇERİĞİNİ yönetiyor; klinik operasyonuyla ilgisi yok. İsim kullanıcı dilinde netleştirilir. (Kaldırılmaz: 60 günlük veri + ana sayfa bölümü aktif çalışıyor.)
3. **Bakım Modu highlight'ı kaldırılır** → Tehlikeli bir sistem işlemi görsel vitrine konmaz; Sistem grubunun en altında yaşar.
4. **Sistem grubu varsayılan kapalı** → Günlük kullanıcı (resepsiyon) menüde yalnızca 3 öğe görür.
5. **Rota değişikliği YOK** → Tüm mevcut URL'ler (`/admin/crm`, `/admin/clinic-rhythm` vb.) aynen korunur; yalnızca menü sunumu, adlandırma ve gruplandırma değişir. Bookmark'lar kırılmaz.

## ROL BAZLI GÖRÜNÜRLÜK (düzeltilmiş)

| Grup / Modül | Admin | Manager (Klinik Yöneticisi) | Reception | Editor |
|---|---|---|---|---|
| Bugün (Dashboard) | ✅ tam | ✅ operasyon+içerik | ✅ sadece operasyon | ✅ sadece içerik |
| Randevu Talepleri | ✅ | ✅ **(YENİ — izin düzeltmesi)** | ✅ | ❌ |
| Mesajlar | ✅ | ✅ **(YENİ)** | ✅ | ❌ |
| Web Sitesi grubu | ✅ | ✅ | ❌ (read-only erişim kaldırılıyor*) | ✅ |
| Blog | ✅ | ✅ | ❌ | ✅ |
| Kullanıcılar/Yetkiler | ✅ | ❌ | ❌ | ❌ |
| Audit | ✅ | ✅ (salt okunur) | ❌ | ❌ |
| Ayarlar | ✅ | ✅ | ❌ | ❌ |
| Bakım Modu | ✅ | ❌ | ❌ | ❌ |

*Resepsiyonun `content:read` izni korunur (API seviyesinde) ama menüde içerik modülleri gösterilmez → menüsü 3 öğeye iner. İhtiyaç halinde URL ile erişebilir.

**İZİN DÜZELTMESİ (kritik):** `ROLE_PERMISSIONS.manager` listesine `leads:*` eklenir. Mevcut durumda Klinik Yöneticisi randevu taleplerini GÖREMİYOR (konfigürasyon hatası).

## RECOMMENDED DASHBOARD STRUCTURE (rapor ekranı → çalışma merkezi)

```
┌─ Seviye 1: BUGÜN YAPILACAKLAR (aksiyon zorunlu) ─────────────────┐
│ • Yanıt bekleyen mesajlar (n) → [Aç] [Ara] [WhatsApp] [Randevuya Dönüştür]
│ • Bugün aranacaklar + GECİKEN takipler → [Ara] [WhatsApp] [Tamamlandı]
│ • Yeni randevu talepleri (n) → [İncele]
│ • Onay bekleyen yorumlar (n) → [Onayla/Reddet]
├─ Seviye 2: HIZLI İŞLEMLER (üste taşınıyor, role göre) ──────────┤
│ [+ Randevu Talebi] [+ Hizmet] [+ Blog (AI)] [Ayarları Düzenle]
├─ Seviye 3: DURUM ÖZETİ (kompakt tek satır) ─────────────────────┤
│ Son 7 gün talep trendi | Memnuniyet 5.0★ | Yayındaki içerik sayıları
├─ Seviye 4: SİSTEM SAĞLIĞI (yalnızca sorun VARSA görünür) ───────┤
│ ör. "2 yayındaki hizmetin görseli eksik", "Ana slider pasif"
└──────────────────────────────────────────────────────────────────┘
KALDIRILANLAR: AI maliyet kartı ($0.00 gürültüsü) → Blog/AI sayfasına,
audit feed'in geniş hali → Sistem > İşlem Kayıtları'na (dashboard'da yok),
galeri istatistik kartı → Galeri sayfasına.
Rol uyarlaması: Reception yalnızca Seviye 1-2 operasyon bölümlerini görür;
Editor içerik odaklı versiyonu görür (onay bekleyen yorum + içerik durumu + hızlı içerik işlemleri).
```

## MODULES TO MERGE / MOVE / SIMPLIFY
- **MERGE:** AI Blog Writer → Blog (menü seviyesinde; route korunur)
- **MOVE:** Klinik Ritmi → Web Sitesi grubu ("Günün Sorusu" adıyla); Audit/Ayarlar/Bakım → kapalı Sistem grubu
- **SIMPLIFY:** Dashboard (7 API → 4 API çağrısı, aksiyon odaklı), sidebar (16 düz öğe → 3-4 grup, rol bazlı 3-9 öğe)
- **KALDIRILMAYACAK modül yok** — hepsi iş değeri üretiyor; sorun yerleşim ve ilişkilendirme.
