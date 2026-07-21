# PRIORITY ROADMAP — Wetnose Veteriner Kliniği

## 🔴 CRITICAL (deploy engeli) — HEPSİ ÇÖZÜLDÜ ✅
| İş | Durum | Efor | İş Etkisi |
|---|---|---|---|
| Stale cache (admin değişiklikleri siteye yansımıyor) | ✅ Çözüldü | - | Kritik güven sorunu giderildi |
| Zayıf JWT secret'ları | ✅ Çözüldü | - | Admin ele geçirme riski kapatıldı |
| Canlıda QA test verileri | ✅ Çözüldü | - | Marka güveni |
| Bayat sitemap (blog'suz) | ✅ Çözüldü | - | SEO indekslenme |

## 🟠 HIGH (deploy öncesi kullanıcı kararı)
| İş | Efor | İş Etkisi | Teknik Etki |
|---|---|---|---|
| **Telefon/WhatsApp numarası onayı + tek kaynağa indirme** (siteData.ts → DB settings) | 1-2 saat | Yüksek: yanlış numara = kayıp müşteri + Local SEO cezası | Düşük risk |
| Production env değişkenleri (`APP_ENV`, `INITIAL_ADMIN_*`, `NEXT_PUBLIC_SITE_URL`) | 10 dk | Zorunlu | - |

## 🟡 MEDIUM (deploy sonrası ilk ay)
| İş | Efor | İş Etkisi | Teknik Etki |
|---|---|---|---|
| Görselleri WebP'ye çevir + boyut küçült (LCP) | 2-3 saat | SEO sıralaması + mobil deneyim | Orta |
| Refresh token'ı yalnızca httpOnly cookie'ye taşı | 3-4 saat | XSS yüzeyi azalır | Orta (frontend refaktör) |
| Bakım modu middleware'ini yeniden etkinleştir | 1-2 saat | Bakım modu güvenilirliği | Düşük |
| `ignoreBuildErrors: true` kaldır, TS hatalarını temizle | 4-6 saat | Uzun vadeli sağlamlık | Orta |
| CSP başlığı (nonce tabanlı) | 3-4 saat | Güvenlik derinliği | Orta |
| Slug çakışmasında 409 dön (şu an 500) | 30 dk | Admin UX | Düşük |

## 🟢 LOW (backlog)
| İş | Efor | İş Etkisi |
|---|---|---|
| AI destekli blog yazımı (PRD P2 — altyapı hazır: /api/admin/ai-blog) | 4-8 saat | İçerik üretim hızı, SEO trafiği |
| Randevu formuna tarih/saat seçimi | 3-4 saat | Dönüşüm artışı |
| Google yorumları entegrasyonu | 2-3 saat | Güven sinyali |
| audit_logs TTL / arşivleme | 30 dk | DB hijyeni |
| `_archived` bileşenler + /app/frontend kalıntı temizliği | 30 dk | Repo hijyeni |
| `prefers-reduced-motion` desteği | 1 saat | Erişilebilirlik |
| Google Business Profile + geo schema | 1 saat | Local SEO |
