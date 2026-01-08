# WETNOSE Admin Erişim Kılavuzu

## Preview Ortamı (Geliştirme/Test)

### Ortam Değişkenleri

Preview ortamında admin erişimi için aşağıdaki değişkenleri `/app/backend/.env` dosyasına ekleyin:

```bash
APP_ENV=preview
STAGE_ADMIN_EMAIL=admin@wetnose.com.tr
STAGE_ADMIN_PASSWORD=WetnoseStage2026!
STAGE_ADMIN_SYNC=true
```

### Nasıl Çalışır?

1. **APP_ENV=preview** olduğunda:
   - Uygulama başlatıldığında otomatik olarak admin kullanıcı oluşturulur/güncellenir
   - `STAGE_ADMIN_PASSWORD` ile şifre senkronize edilir
   - `must_change_password = false` olarak ayarlanır (zorunlu şifre değişikliği kapalı)
   - Cookie ayarları preview için optimize edilir (secure=false)

2. **STAGE_ADMIN_SYNC=true** (varsayılan):
   - Her başlatmada şifre env'deki değerle senkronize edilir
   - Bu sayede şifre her zaman güncel kalır
   - `false` yaparsanız, şifre sadece ilk oluşturmada ayarlanır

### Preview'da Giriş

**URL:** `{PREVIEW_URL}/admin/login`

**Kullanıcı Bilgileri:**
- **Email:** admin@wetnose.com.tr (veya STAGE_ADMIN_EMAIL)
- **Şifre:** WetnoseStage2026! (veya STAGE_ADMIN_PASSWORD)

---

## Production Ortamı (Canlı)

### Ortam Değişkenleri

Production ortamında aşağıdaki değişkenleri ayarlayın:

```bash
APP_ENV=production
INITIAL_ADMIN_EMAIL=admin@wetnose.com.tr
INITIAL_ADMIN_PASSWORD=GucluBirSifre123!@#

# Cookie güvenliği
COOKIE_SECURE=true
COOKIE_DOMAIN=.wetnose.com.tr
COOKIE_SAMESITE=lax

# JWT güvenliği (32+ karakter, benzersiz)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters
```

### Nasıl Çalışır?

1. **APP_ENV=production** olduğunda:
   - Admin kullanıcı sadece mevcut değilse oluşturulur
   - `must_change_password = true` olarak ayarlanır
   - İlk girişte şifre değişikliği zorunludur
   - Cookie güvenliği sıkılaştırılır

2. **Güvenlik Kuralları:**
   - `COOKIE_SECURE=true` zorunludur (aksi halde uygulama başlamaz)
   - Şifreler loglara yazılmaz
   - Admin şifresi otomatik olarak güncellenmez

### Production'da İlk Giriş

1. Admin paneline gidin: `https://www.wetnose.com.tr/admin/login`
2. `INITIAL_ADMIN_EMAIL` ve `INITIAL_ADMIN_PASSWORD` ile giriş yapın
3. Sistem sizi `/admin/force-password-change` sayfasına yönlendirir
4. Yeni şifrenizi belirleyin (min 10 karakter, büyük/küçük harf, rakam, sembol)
5. Şifre değiştirdikten sonra admin paneline erişebilirsiniz

---

## Şifre Politikası

Tüm ortamlarda şifre değişikliği için:

- **Minimum 10 karakter**
- **En az 1 büyük harf** (A-Z)
- **En az 1 küçük harf** (a-z)
- **En az 1 rakam** (0-9)
- **En az 1 özel karakter** (!@#$%^&*(),.?":{}|<>)

---

## "Beni Hatırla" Özelliği

Login sayfasında "Beni hatırla" seçeneği:

- **İşaretli:** Oturum 30 gün açık kalır
- **İşaretsiz:** Oturum 7 gün açık kalır
- Access token her durumda 15 dakika geçerlidir

---

## Sorun Giderme

### "Çok fazla deneme yapıldı" Hatası

- Rate limiting aktif: 15 deneme / 15 dakika
- 15 dakika bekleyin veya farklı bir IP kullanın
- Preview'da: Backend'i restart edin (rate limit sıfırlanır)

### Cookie Sorunları

Preview'da çerez sorunları yaşıyorsanız:

```bash
# .env dosyasında
COOKIE_SECURE=false
COOKIE_DOMAIN=
```

### Şifre Sıfırlama (Preview)

1. `.env` dosyasında `STAGE_ADMIN_PASSWORD` değerini değiştirin
2. Backend'i restart edin: `sudo supervisorctl restart backend`
3. Yeni şifre ile giriş yapın

---

## Güvenlik Notları

⚠️ **UYARI:** Bu bilgiler sadece geliştirme ve test amaçlıdır.

- Production'da varsayılan şifreleri ASLA kullanmayın
- `.env` dosyasını versiyon kontrolüne eklemeyin
- Şifreleri güvenli bir şekilde saklayın (örn: Vault, AWS Secrets Manager)
- Rate limiting limitlerini production'da daha sıkı tutun
