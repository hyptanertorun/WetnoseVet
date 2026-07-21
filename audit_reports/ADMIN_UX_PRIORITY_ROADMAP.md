# ADMIN UX PRIORITY ROADMAP — Uygulama Planı

## KARAR ÖZETİ
```
ADMIN PANEL CURRENT SCORE:        62/100
FUNCTIONAL COMPLEXITY SCORE:      45/100
FIRST-TIME USER CLARITY SCORE:    50/100
MODULE INTEGRATION SCORE:         40/100
PANEL–FRONTEND SYNC SCORE:        70/100
ROLE-BASED USABILITY SCORE:       55/100

MAIN PROBLEMS:
  1. 16 öğeli düz menü — grup/hiyerarşi/rol sadeleştirmesi yok
  2. Dashboard rapor deposu — hızlı işlemler en altta, gürültü kartları ortada
  3. Mesaj ↔ Randevu kopuk — manuel kopyalama gerekiyor
  4. Manager rolü CRM'e erişemiyor (izin konfigürasyon HATASI)
  5. Tek veri kaynağı ihlali — WhatsApp butonu ve 6 nokta statik veriden, panelle çelişiyor
  6. Blog/Ekip ↔ Hizmet ilişkisi yok

MODULES TO MERGE:  AI Blog Writer → Blog (menü seviyesinde)
MODULES TO MOVE:   Klinik Ritmi → Web Sitesi grubu ("Günün Sorusu");
                   Audit/Ayarlar/Bakım/Kullanıcılar/Yetkiler → kapalı Sistem grubu
MODULES TO SIMPLIFY: Dashboard, Sidebar
MISSING INTEGRATIONS: Mesaj→Randevu, Ayarlar→tüm frontend, Blog↔Hizmet, Ekip↔Hizmet
FRONTEND SYNC RISKS: siteData.ts statik iletişim verisi (7 nokta)

FILES AND ROUTES TO CHANGE (rota URL'leri DEĞİŞMEZ):
  - src/app/admin/components/AdminSidebar.tsx (gruplu menü)
  - src/app/admin/page.tsx (dashboard yeniden yapılandırma)
  - src/lib/adminAuth.ts (manager izin düzeltmesi + sayfa görünürlüğü)
  - src/app/admin/contact/page.tsx + api/admin/contact (dönüştürme aksiyonu)
  - src/components/WhatsappButton.tsx, Header.tsx, ContactForm.tsx,
    iletisim/randevu/hakkimizda sayfaları (settings'e bağlama)
  - src/app/admin/blog/page.tsx (AI Yazar giriş noktası + hizmet seçici)
  - src/app/api/admin/blog + models/types.ts (related_service_ids)

DATABASE CHANGES (hepsi geriye uyumlu, opsiyonel alan ekleme):
  - contact_messages.converted_appointment_id (yeni, opsiyonel)
  - appointments.source_message_id (yeni, opsiyonel)
  - blog_posts.related_service_ids (yeni, opsiyonel)
  - team_members.service_ids (yeni, opsiyonel)
  - VERİ KAYBI YOK, migration script GEREKMEZ (alanlar yokken undefined kabul edilir)

MIGRATION RISKS: Düşük. Rota ve API sözleşmeleri korunur; yeni alanlar opsiyonel.
  Tek dikkat: siteData temizliği öncesi doğru telefon onayı ZORUNLU.

TEST PLAN: Her faz sonunda testing agent (rol bazlı giriş, E2E senaryolar 1-5,
  panel→frontend senkron testi, regresyon). Mevcut 29'luk pytest suite'i genişletilir.
```

## UYGULAMA FAZLARI

### FAZ 1 — Analiz ✅ (bu raporlar)

### FAZ 2 — Bilgi Mimarisi + Dashboard (etki: YÜKSEK, risk: DÜŞÜK, efor: ~1 oturum)
| İş | Problem | Kullanıcı etkisi | Teknik risk |
|---|---|---|---|
| Gruplu, collapsible, rol bazlı sidebar | Menü karmaşası | Resepsiyon 3, editör ~8 öğe görür | Düşük (yalnızca sunum) |
| Manager'a `leads:*` izni | Yönetici CRM göremiyor | Kritik akış açılır | Düşük |
| Dashboard yeniden yapılandırma: Bugün Yapılacaklar üste (mesajlar dahil), Hızlı İşlemler üste, AI/galeri/audit kartları kaldırılır, rol bazlı görünüm | Rapor deposu | "Ne yapmalıyım?" ilk ekranda | Orta (büyük sayfa refaktörü) |
| Aksiyon kartları: mesaj/talep satırından Ara, WhatsApp, durum değiştirme | Gösterme→aksiyon | Az tıklama | Düşük |

### FAZ 3 — Entegrasyonlar + Tek Veri Kaynağı (etki: YÜKSEK, risk: ORTA)
| İş | Problem | Kullanıcı etkisi | Teknik risk |
|---|---|---|---|
| Mesaj → Randevuya Dönüştür | Kopuk sistemler | Manuel kopyalama biter | Düşük |
| siteData → DB settings (7 nokta) | Veri çelişkisi | Panel gerçek kontrol merkezi olur | Orta (**numara onayı ön koşul**) |
| Ayarlar sayfasına eksik alanlar (Google Maps, sosyal medya vb. varsa) | Merkezileşme | | Düşük |

### FAZ 4 — İçerik İlişkileri + Durum Dili (etki: ORTA)
| İş | Etki |
|---|---|
| Blog ↔ Hizmet (related_service_ids + hizmet detayında ilgili yazılar) | SEO iç bağlantı + dönüşüm |
| Ekip ↔ Hizmet (service_ids + hizmet detayında uzmanlar) | Güven sinyali |
| UI durum dili standardizasyonu (Taslak/Yayında/Arşiv) | Tutarlılık |

### FAZ 5 — Kullanılabilirlik (etki: ORTA)
| İş | Etki |
|---|---|
| Boş/hata/loading durumları yönlendirici metinlerle | İlk kullanım netliği |
| Form sadeleştirme (temel/gelişmiş bölüm ayrımı — ekip 1413, slider 1109 satır formları) | Hata azaltma |
| Sistem Sağlığı bölümü (yalnızca sorun varsa görünür) | Proaktif bakım |
| Global arama (talep/mesaj/hizmet/blog) | Hız — yalnızca gerçek değer katarsa |

### FAZ 6 — Test & Doğrulama (her fazın sonunda + final)
- Senaryo 1: form → talep → ara/WhatsApp → dönüştür → takip → audit → dashboard
- Senaryo 2: hizmet taslak → yayın → frontend → sitemap → arşiv → frontend'den kalkma
- Senaryo 3: ekip üyesi → hizmet ilişkisi → frontend görünümü → pasif → kalkma
- Senaryo 4: AI taslak → editör → hizmet bağı → yayın → ilgili hizmette görünme
- Senaryo 5: ayar değişikliği → header/footer/WhatsApp/iletisim/schema yansıması
- Rol bazlı: 4 rolle giriş → menü/dashboard/erişim doğrulama
