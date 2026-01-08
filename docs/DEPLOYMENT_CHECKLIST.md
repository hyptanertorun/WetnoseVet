# WETNOSE Veteriner Kliniği - Production Deployment Checklist
# Target: https://www.wetnose.com.tr

## 🌐 Domain & Canonical Rules

### Primary Domain
- **Canonical:** `https://www.wetnose.com.tr`
- **API:** `https://api.wetnose.com.tr` (veya `https://www.wetnose.com.tr/api`)

### Required Redirects (301)
```
http://wetnose.com.tr       -> https://www.wetnose.com.tr
https://wetnose.com.tr      -> https://www.wetnose.com.tr
http://www.wetnose.com.tr   -> https://www.wetnose.com.tr
```

---

## 🔐 Backend Environment Variables

```bash
# Environment
APP_ENV=production

# Database
MONGO_URL=mongodb://production-mongo:27017
DB_NAME=wetnose_production

# JWT Secrets (min 32 karakter, rastgele string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters

# Cookie Settings (CRITICAL for www domain)
COOKIE_SECURE=true
COOKIE_DOMAIN=.wetnose.com.tr
COOKIE_SAMESITE=lax

# CORS (restrict to production domains only)
CORS_ORIGINS=https://www.wetnose.com.tr,https://wetnose.com.tr

# Initial Admin (one-time setup)
INITIAL_ADMIN_EMAIL=admin@wetnose.com.tr
INITIAL_ADMIN_PASSWORD=SecureInitialPassword123!@#

# Rate Limiting (optional, defaults are sane)
RATE_LIMIT_LOGIN=15
RATE_LIMIT_LOGIN_WINDOW=900
```

---

## 🖥️ Frontend Environment Variables

```bash
NEXT_PUBLIC_BACKEND_URL=https://www.wetnose.com.tr
NEXT_PUBLIC_SITE_URL=https://www.wetnose.com.tr
```

---

## 🔒 SSL / Security Headers

### SSL Requirements
- [x] SSL certificate for `wetnose.com.tr` AND `www.wetnose.com.tr`
- [x] Auto-redirect HTTP to HTTPS
- [x] HSTS enabled in production

### Security Headers (Auto-configured in server.py)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only)

---

## ✅ Pre-Deployment Checklist

### Backend
- [ ] `APP_ENV=production` set
- [ ] `COOKIE_SECURE=true` set
- [ ] `COOKIE_DOMAIN=.wetnose.com.tr` set
- [ ] `CORS_ORIGINS` restricted to production domains
- [ ] JWT secrets are unique and 32+ characters
- [ ] MongoDB connection string is production
- [ ] Admin user has `must_change_password=true` on first login
- [ ] No dev-only endpoints exposed

### Frontend
- [ ] `NEXT_PUBLIC_BACKEND_URL` points to production API
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.wetnose.com.tr`
- [ ] `yarn build` passes without errors
- [ ] All admin pages have `noindex,nofollow` meta

### DNS/Infrastructure
- [ ] DNS A/CNAME records configured
- [ ] SSL certificates valid
- [ ] 301 redirects from non-www to www configured
- [ ] CDN/proxy configured (if applicable)

---

## 🧪 Smoke Tests (Post-Deploy)

### 1. DNS & Routing
```bash
# Check redirects
curl -I http://wetnose.com.tr
# Expect: 301 -> https://www.wetnose.com.tr

curl -I https://wetnose.com.tr
# Expect: 301 -> https://www.wetnose.com.tr

curl -I https://www.wetnose.com.tr
# Expect: 200 OK
```

### 2. SEO Files
```bash
# Robots.txt
curl https://www.wetnose.com.tr/robots.txt
# Verify: /admin, /api/admin, /geri-bildirim disallowed

# Sitemap
curl https://www.wetnose.com.tr/sitemap.xml
# Verify: All URLs use https://www.wetnose.com.tr
```

### 3. Security Headers
```bash
curl -I https://www.wetnose.com.tr
# Check for:
# - Strict-Transport-Security
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
```

### 4. Admin Login
```bash
# Test login works
curl -X POST https://www.wetnose.com.tr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wetnose.com.tr","password":"YOUR_PASSWORD"}'
# Expect: access_token in response, must_change_password=true for new admin
```

### 5. Rate Limiting
```bash
# Exceed login attempts (16+)
# Expect: 429 with retry_after_seconds
```

### 6. Critical User Journeys
- [ ] Submit appointment request → CRM lead created
- [ ] Submit feedback → pending in admin
- [ ] Approve feedback → shows on homepage
- [ ] Admin login → dashboard loads
- [ ] Edit settings (YouTube/Pinterest) → visible in footer

---

## 🔑 Admin First Login (Production)

1. Go to `https://www.wetnose.com.tr/admin/login`
2. Login with `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`
3. System forces redirect to `/admin/force-password-change`
4. Set new password (min 10 chars, uppercase, lowercase, number, symbol)
5. After change, access admin dashboard

---

## 📊 Post-Deploy Monitoring

- [ ] Check server logs for errors
- [ ] Monitor rate limiting effectiveness
- [ ] Verify Google Search Console shows sitemap
- [ ] Test social media icons in footer (YouTube, Pinterest)
- [ ] Verify WhatsApp button works on mobile

---

## 🚀 Go-Live Steps

1. **DNS Setup**: Point domain to server
2. **SSL**: Verify certificates are valid
3. **Deploy Backend**: With production env vars
4. **Deploy Frontend**: Build and deploy
5. **Run Smoke Tests**: Above checklist
6. **Monitor**: Check logs for first hour
7. **Announce**: Update social media / notify users

---

## 📞 Emergency Contacts

- **Technical Issues**: [Emergent Platform Support]
- **Domain/DNS**: [Domain Registrar]
- **SSL Certificates**: [Certificate Authority]
- **Database**: [MongoDB Atlas / Provider]

---

## 📝 Release Notes - P2.5

**Date:** 2025-12-25

**Features:**
- Full-stack veterinary clinic website
- Admin panel with RBAC, CRM, Blog, Team, Services management
- AI Blog Writer with revision UI
- Clinic Rhythm daily content module
- Comprehensive SEO infrastructure
- Mobile-first responsive design
- Rate limiting and security hardening

**Social Media:**
- YouTube and Pinterest links added to settings
- Dynamic footer social icons

**Known Issues:**
- None (all resolved)

**Production Credentials:**
- Email: admin@wetnose.com.tr
- Password: Set via `INITIAL_ADMIN_PASSWORD` env (change on first login)
