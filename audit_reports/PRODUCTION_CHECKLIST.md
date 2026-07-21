# PRODUCTION CHECKLIST — Wetnose Veteriner Kliniği

## Deploy ÖNCESİ (zorunlu)
- [x] Production build başarılı (`yarn build`)
- [x] Tüm API route'ları dinamik (stale cache çözüldü)
- [x] Güvenlik başlıkları aktif
- [x] JWT secret'ları güçlü rastgele değerlerle yenilendi
- [x] MongoDB index'leri oluşturuldu
- [x] QA/test verileri DB'den temizlendi
- [x] Sitemap + robots.txt dinamik ve doğru
- [x] 29/29 otomatik test + E2E regresyon geçti
- [ ] **KULLANICI: Telefon/WhatsApp numarası onayı** — statik veri (0553 484 54 24) vs admin ayarları (0262 321 33 53 / 0544 938 66 73). Onay sonrası tek kaynağa indirilecek.
- [ ] **DEPLOY ORTAMINDA: `APP_ENV=production`** yapın (cookie'ler otomatik `secure` olur, stage admin devre dışı kalır → `INITIAL_ADMIN_EMAIL/PASSWORD` tanımlayın).
- [ ] **DEPLOY ORTAMINDA: `NEXT_PUBLIC_SITE_URL`** gerçek domain ile ayarlayın (varsayılan: https://www.wetnose.com.tr — doğruysa dokunmayın).

## Deploy SONRASI (ilk 24 saat)
- [ ] Gerçek domain üzerinde admin login + bir hizmet güncelleme testi
- [ ] Google Search Console'a sitemap gönderimi
- [ ] PageSpeed Insights ölçümü (LCP kontrolü)
- [ ] İletişim + randevu formu gerçek test gönderimi
- [ ] Admin şifresini değiştirin (audit sırasında paylaşıldı)

## İzleme / Bakım
- [ ] Uptime izleme (ör. UptimeRobot — ücretsiz)
- [ ] MongoDB yedekleme planı (günlük dump önerilir)
- [ ] Audit log büyümesi: 6 ayda bir kontrol (veya TTL ekleyin)

## Bilinçli Kabul Edilen Riskler
- Görsel optimizasyonu kapalı (`images.unoptimized`) — deploy sonrası WebP iyileştirmesi planlı
- Rate limit in-memory — tek instance için yeterli
- CSP başlığı yok — ayrı çalışma gerektirir (orta öncelik)
- Bakım modu middleware'i devre dışı — bakım modunu kullanacaksanız yeniden etkinleştirilmeli
