# WETNOSE Production Cutover Runbook
# Target: https://www.wetnose.com.tr

## Version: 1.0.0
## Date: December 2025
## Author: Emergent Engineering Team

---

# A) PRE-FLIGHT CHECKLIST

## A1. Build Verification
```bash
# Ensure latest code is built
cd /app/frontend && yarn build

# Expected: "Done in X.XXs" with no errors
# All routes should be listed including:
# - /admin/*
# - /preview/*
# - /saglik-rehberi/*
# - /hizmetler/*
# - /ekibimiz/*
```

## A2. Environment Variables (Backend)

Create or update `/app/backend/.env` with production values:

```bash
# REQUIRED - Environment
APP_ENV=production

# REQUIRED - Database
MONGO_URL=mongodb://your-production-mongo:27017
DB_NAME=wetnose_production

# REQUIRED - JWT (generate secure random strings, 64+ chars)
JWT_SECRET=your-production-jwt-secret-minimum-64-characters-here-change-this
JWT_REFRESH_SECRET=your-production-refresh-secret-minimum-64-characters-change-this

# REQUIRED - Cookie Security
COOKIE_SECURE=true
COOKIE_DOMAIN=.wetnose.com.tr
COOKIE_SAMESITE=lax

# REQUIRED - CORS (only production domains)
CORS_ORIGINS=https://www.wetnose.com.tr,https://wetnose.com.tr

# REQUIRED - Initial Admin (one-time)
INITIAL_ADMIN_EMAIL=admin@wetnose.com.tr
INITIAL_ADMIN_PASSWORD=TempSecurePassword123!@#

# OPTIONAL - AI Features
EMERGENT_LLM_KEY=sk-emergent-xxxxx
```

## A3. Environment Variables (Frontend)

Create or update `/app/frontend/.env`:

```bash
REACT_APP_BACKEND_URL=https://www.wetnose.com.tr
NEXT_PUBLIC_BACKEND_URL=https://www.wetnose.com.tr
NEXT_PUBLIC_SITE_URL=https://www.wetnose.com.tr
```

## A4. MongoDB Indexes

Ensure indexes exist for optimal performance:

```javascript
// Run in MongoDB shell or compass
use wetnose_production

// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "id": 1 }, { unique: true })

// Blog posts
db.blog_posts.createIndex({ "id": 1 }, { unique: true })
db.blog_posts.createIndex({ "slug": 1 }, { unique: true })
db.blog_posts.createIndex({ "status": 1 })

// Services
db.services.createIndex({ "id": 1 }, { unique: true })
db.services.createIndex({ "slug": 1 }, { unique: true })

// Team members
db.team_members.createIndex({ "id": 1 }, { unique: true })
db.team_members.createIndex({ "slug": 1 }, { unique: true })

// CRM leads
db.crm_leads.createIndex({ "id": 1 }, { unique: true })
db.crm_leads.createIndex({ "status": 1 })
db.crm_leads.createIndex({ "created_at": -1 })

// Clinic rhythm
db.clinic_rhythm_entries.createIndex({ "id": 1 }, { unique: true })
db.clinic_rhythm_entries.createIndex({ "date_key": 1 }, { unique: true })
db.clinic_rhythm_entries.createIndex({ "status": 1 })

// Testimonials
db.testimonials.createIndex({ "id": 1 }, { unique: true })
db.testimonials.createIndex({ "status": 1 })
```

## A5. Backup Plan

Before cutover:
1. Export MongoDB data: `mongodump --uri="mongodb://..." --out=/backup/pre-cutover`
2. Note current DNS settings
3. Document current SSL certificate details

---

# B) DNS CONFIGURATION

## B1. DNS Records (Example for Cloudflare/Route53)

```
# A Records (if using direct IP)
Type: A
Name: www
Value: <server-ip>
TTL: 300 (5 min for initial cutover, increase later)

# CNAME for root domain redirect
Type: CNAME
Name: @ (or wetnose.com.tr)
Value: www.wetnose.com.tr
TTL: 300

# OR use page rules/redirects for root -> www
```

## B2. Root Domain Redirect Strategy

**Option A: DNS-level redirect (Cloudflare Page Rules)**
```
URL: wetnose.com.tr/*
Setting: Forwarding URL (301)
Destination: https://www.wetnose.com.tr/$1
```

**Option B: Server-level redirect (nginx/caddy)**
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name wetnose.com.tr;
    return 301 https://www.wetnose.com.tr$request_uri;
}
```

---

# C) SSL ACTIVATION

## C1. Certificate Requirements
- Valid for: `wetnose.com.tr` AND `www.wetnose.com.tr`
- Type: Let's Encrypt (free) or commercial
- Auto-renewal configured

## C2. Verification
```bash
# Check SSL certificate
curl -I https://www.wetnose.com.tr
# Expected: HTTP/2 200, valid cert

# Check HSTS header
curl -I https://www.wetnose.com.tr | grep -i strict
# Expected: strict-transport-security: max-age=31536000; includeSubDomains
```

---

# D) DEPLOY STEPS

## D1. Pre-Deploy
```bash
# 1. Set production environment
export APP_ENV=production

# 2. Verify environment validation passes
cd /app/backend
python -c "from server import validate_environment; print('OK')"
```

## D2. Deploy via Emergent Platform
1. Navigate to Emergent Dashboard
2. Select WETNOSE project
3. Click "Deploy to Production"
4. Verify deployment status

## D3. Post-Deploy Verification
```bash
# Check backend health
curl https://www.wetnose.com.tr/api/health
# Expected: {"status": "ok"}

# Check frontend loads
curl -I https://www.wetnose.com.tr
# Expected: HTTP/2 200

# Check admin login page
curl -I https://www.wetnose.com.tr/admin/login
# Expected: HTTP/2 200
```

---

# E) POST-DEPLOY SMOKE TESTS

Run the smoke test suite from `/app/docs/SMOKE_TEST_REPORT.md`

Quick checklist:
- [ ] Homepage loads
- [ ] Admin login works
- [ ] Forced password change works (first login)
- [ ] SEO files (/robots.txt, /sitemap.xml) correct
- [ ] Rate limiting returns 429 with retry_after_seconds
- [ ] HTTPS redirect works

---

# F) ROLLBACK PROCEDURE

## F1. Quick Rollback (< 5 min)

If critical issues found immediately after deploy:

```bash
# Option 1: Emergent Platform rollback
# Use "Rollback" button in Emergent dashboard

# Option 2: DNS failover
# Point DNS back to previous server/deployment
```

## F2. Database Rollback (if needed)

```bash
# Restore from pre-cutover backup
mongorestore --uri="mongodb://..." /backup/pre-cutover

# Note: This will lose any data created after cutover
```

## F3. Rollback Triggers

Initiate rollback if:
- [ ] Homepage returns 500+ errors for > 2 minutes
- [ ] Admin login completely broken (not just rate limited)
- [ ] Database connection failures
- [ ] SSL certificate invalid
- [ ] Critical security vulnerability discovered

## F4. Post-Rollback Steps

1. Document what went wrong
2. Fix issues in preview environment
3. Re-test thoroughly
4. Schedule new cutover window

---

# G) POST-CUTOVER MONITORING

## G1. First Hour
- Monitor error logs every 10 minutes
- Check rate limiting isn't blocking legitimate users
- Verify admin can access all features

## G2. First Day
- Review audit logs for unusual activity
- Check Google Search Console for crawl errors
- Monitor server resource usage

## G3. First Week
- Verify all scheduled tasks run
- Check email deliverability (if applicable)
- Review user feedback

---

# H) EMERGENCY CONTACTS

- **Platform Issues**: Emergent Support
- **DNS Issues**: Domain Registrar Support
- **Database Issues**: MongoDB Atlas Support
- **SSL Issues**: Certificate Provider

---

# APPENDIX: PRODUCTION ENVIRONMENT VARIABLES TEMPLATE

```bash
# Copy to /app/backend/.env for production
APP_ENV=production
MONGO_URL=mongodb://user:pass@host:27017
DB_NAME=wetnose_production
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>
COOKIE_SECURE=true
COOKIE_DOMAIN=.wetnose.com.tr
COOKIE_SAMESITE=lax
CORS_ORIGINS=https://www.wetnose.com.tr,https://wetnose.com.tr
INITIAL_ADMIN_EMAIL=admin@wetnose.com.tr
INITIAL_ADMIN_PASSWORD=<secure-temp-password>
EMERGENT_LLM_KEY=sk-emergent-xxxxx
```

---

**Document Status**: READY FOR PRODUCTION
**Last Updated**: 2025-12-25
