# WETNOSE Production Smoke Test Report
# Target: https://www.wetnose.com.tr

## Test Date: _____________
## Tester: _____________
## Environment: Production

---

# 1) PUBLIC PAGE SMOKE TESTS

## 1.1 Homepage
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Page loads | 200 OK, no console errors | | ☐ |
| Hero section visible | Title, CTA buttons | | ☐ |
| Klinik Ritmi module | Shows latest published entry (or hidden if none) | | ☐ |
| Testimonials carousel | Only approved + consent_public items | | ☐ |
| Footer social icons | Dynamic based on settings | | ☐ |

**Command to verify:**
```bash
curl -I https://www.wetnose.com.tr
# Expected: HTTP/2 200
```

## 1.2 Hizmetler (Services)
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /hizmetler list loads | Services grid visible | | ☐ |
| /hizmetler/[slug] loads | Service detail page | | ☐ |
| Images load | Cover images or fallback | | ☐ |

## 1.3 Ekibimiz (Team)
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /ekibimiz list loads | Team members visible | | ☐ |
| /ekibimiz/[slug] loads | Member detail page | | ☐ |
| Photos load | Team photos or fallback | | ☐ |

## 1.4 Sağlık Rehberi (Blog)
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /saglik-rehberi list loads | Published posts only | | ☐ |
| /saglik-rehberi/[slug] loads | Post detail with content | | ☐ |
| FAQ accordion works | Expand/collapse on click | | ☐ |
| Klinik Gündemi section | Visible under title | | ☐ |

## 1.5 Randevu Form
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /randevu loads | Form visible | | ☐ |
| Form submission | Creates CRM lead | | ☐ |
| Validation works | Error messages on invalid | | ☐ |
| Success message | Shown after submit | | ☐ |

**Verify CRM lead created:**
```bash
# Login and check CRM
curl -X POST https://www.wetnose.com.tr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wetnose.com.tr","password":"YOUR_PASSWORD"}' | jq '.access_token'

# Then check CRM leads
curl https://www.wetnose.com.tr/api/admin/crm/leads \
  -H "Authorization: Bearer TOKEN"
```

---

# 2) SEO SMOKE TESTS

## 2.1 Sitemap
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /sitemap.xml loads | XML content | | ☐ |
| All URLs use www | https://www.wetnose.com.tr/* | | ☐ |
| No admin URLs | /admin not in sitemap | | ☐ |
| No preview URLs | /preview not in sitemap | | ☐ |
| Only published content | Draft posts excluded | | ☐ |

**Command:**
```bash
curl https://www.wetnose.com.tr/sitemap.xml | grep -c "www.wetnose.com.tr"
# Should return number > 0

curl https://www.wetnose.com.tr/sitemap.xml | grep -c "/admin"
# Should return 0

curl https://www.wetnose.com.tr/sitemap.xml | grep -c "/preview"
# Should return 0
```

## 2.2 Robots.txt
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /robots.txt loads | Text content | | ☐ |
| Disallow /admin | Present | | ☐ |
| Disallow /admin/* | Present | | ☐ |
| Disallow /api/admin/* | Present | | ☐ |
| Disallow /preview | Present | | ☐ |
| Disallow /preview/* | Present | | ☐ |
| Sitemap reference | https://www.wetnose.com.tr/sitemap.xml | | ☐ |

**Command:**
```bash
curl https://www.wetnose.com.tr/robots.txt
```

## 2.3 Canonical & Schema
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Blog detail canonical | https://www.wetnose.com.tr/saglik-rehberi/[slug] | | ☐ |
| Article schema present | JSON-LD type:Article | | ☐ |
| FAQ schema present | JSON-LD type:FAQPage (if FAQs exist) | | ☐ |
| BreadcrumbList schema | JSON-LD type:BreadcrumbList | | ☐ |

## 2.4 Admin Noindex
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /admin pages | noindex,nofollow meta | | ☐ |
| /preview pages | noindex,nofollow meta | | ☐ |

**Command:**
```bash
curl -s https://www.wetnose.com.tr/admin/login | grep -i "noindex"
# Should find noindex meta tag
```

---

# 3) ADMIN SMOKE TESTS

## 3.1 Login
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /admin/login loads | Login form visible | | ☐ |
| Invalid credentials | "E-posta veya şifre hatalı" error | | ☐ |
| Valid credentials | Redirect to /admin | | ☐ |
| Remember me OFF | 7-day token | | ☐ |
| Remember me ON | 30-day token | | ☐ |

## 3.2 Forced Password Change (Production Initial Admin)
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Initial admin login | Redirect to /admin/force-password-change | | ☐ |
| Password requirements shown | Min 10 chars, upper, lower, number, symbol | | ☐ |
| Valid password accepted | Redirect to /admin | | ☐ |
| must_change_password cleared | Future logins go directly to /admin | | ☐ |

## 3.3 CRM
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /admin/crm loads | Lead list visible | | ☐ |
| Filters work | Status, date range | | ☐ |
| Lead scoring visible | Score indicators | | ☐ |
| Status change works | Update persists | | ☐ |

## 3.4 Blog AI Writer
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| AI writer accessible | Button/panel visible | | ☐ |
| Generation works | OR graceful error if no budget | | ☐ |
| AI revision works | OR graceful error if no budget | | ☐ |

## 3.5 Preview Token System
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Token generation | 10-min expiry | | ☐ |
| Preview opens | Content visible with banner | | ☐ |
| Expired token | Error message shown | | ☐ |
| Preview noindex | Not in search results | | ☐ |

---

# 4) SECURITY SMOKE TESTS

## 4.1 Authentication
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| /api/admin/* without auth | 401 Unauthorized | | ☐ |
| /api/admin/* with invalid token | 401 Unauthorized | | ☐ |
| /api/admin/* with expired token | 401 Unauthorized | | ☐ |

**Command:**
```bash
curl -s https://www.wetnose.com.tr/api/admin/settings | jq '.detail'
# Expected: "Giriş yapmalısınız" or similar
```

## 4.2 Rate Limiting
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Exceed login attempts (16+) | 429 Too Many Requests | | ☐ |
| Response includes retry_after_seconds | Number in seconds | | ☐ |
| Rate limit clears after window | Can login again | | ☐ |

**Command:**
```bash
# Run 16+ times rapidly
for i in {1..16}; do
  curl -s -X POST https://www.wetnose.com.tr/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' | jq '.detail'
done
# Last few should show rate limit message with retry_after_seconds
```

## 4.3 Security Headers
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains | | ☐ |
| X-Content-Type-Options | nosniff | | ☐ |
| X-Frame-Options | DENY | | ☐ |
| Referrer-Policy | strict-origin-when-cross-origin | | ☐ |

**Command:**
```bash
curl -I https://www.wetnose.com.tr/api/health
```

## 4.4 HTTPS Redirect
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| http://wetnose.com.tr | 301 to https://www.wetnose.com.tr | | ☐ |
| https://wetnose.com.tr | 301 to https://www.wetnose.com.tr | | ☐ |
| http://www.wetnose.com.tr | 301 to https://www.wetnose.com.tr | | ☐ |

---

# 5) MOBILE RESPONSIVENESS

| Page | 375px | 768px | 1440px | Status |
|------|-------|-------|--------|--------|
| Homepage | No overflow | OK | OK | ☐ |
| /hizmetler | No overflow | OK | OK | ☐ |
| /saglik-rehberi | No overflow | OK | OK | ☐ |
| /admin/login | No overflow | OK | OK | ☐ |
| /preview/* | No overflow | OK | OK | ☐ |

---

# 6) FINAL VERIFICATION

## Go-Live Approval Checklist

| Item | Status |
|------|--------|
| All public pages load without errors | ☐ |
| Admin login and core features work | ☐ |
| SEO files (robots, sitemap) correct | ☐ |
| Security headers present | ☐ |
| Rate limiting functional | ☐ |
| HTTPS enforced on all endpoints | ☐ |
| Initial admin can change password | ☐ |
| Mobile experience acceptable | ☐ |

---

## Test Results Summary

- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___

## Issues Found

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

## Sign-Off

- [ ] QA Approved
- [ ] Security Approved  
- [ ] Product Approved

**Approver**: _____________
**Date**: _____________

---

**GO-LIVE STATUS**: ☐ APPROVED / ☐ NOT APPROVED

**Notes**:
_____________________________________________
