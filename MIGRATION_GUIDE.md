# Wetnose Veteriner - Next.js Full-Stack Migration

## Overview
This project has been migrated from React + FastAPI to a **full Next.js 14+ application** using the App Router.

## Project Structure
```
/app
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (replaces FastAPI)
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── public/       # Public API endpoints
│   │   │   ├── admin/        # Admin API endpoints
│   │   │   ├── contact/      # Contact form submission
│   │   │   └── uploads/      # File serving
│   │   ├── admin/            # Admin panel pages
│   │   └── [public pages]    # Public website pages
│   ├── lib/
│   │   ├── db/               # MongoDB connection
│   │   ├── models/           # TypeScript types
│   │   ├── services/         # Business logic services
│   │   └── middleware/       # Auth & rate limiting
│   └── components/           # React components
├── storage/
│   └── uploads/              # File uploads directory
├── .env                      # Environment variables
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
└── tailwind.config.ts        # Tailwind CSS configuration
```

## Route Migration Map

### Authentication Routes
| FastAPI Route | Next.js Route | Status |
|--------------|---------------|--------|
| POST /api/auth/login | POST /api/auth/login | ✅ |
| POST /api/auth/logout | POST /api/auth/logout | ✅ |
| POST /api/auth/refresh | POST /api/auth/refresh | ✅ |
| GET /api/auth/me | GET /api/auth/me | ✅ |
| POST /api/auth/change-password | POST /api/auth/change-password | ✅ |

### Public API Routes
| FastAPI Route | Next.js Route | Status |
|--------------|---------------|--------|
| GET /api/status | GET /api/status | ✅ (NEW - Returns DB connection info) |
| GET /api/public/settings | GET /api/public/settings | ✅ |
| GET /api/public/maintenance-status | GET /api/public/maintenance-status | ✅ |
| GET /api/public/services | GET /api/public/services | ✅ |
| GET /api/public/services/{slug} | GET /api/public/services/[slug] | ✅ |
| GET /api/public/team-members | GET /api/public/team-members | ✅ |
| GET /api/public/team-members/{slug} | GET /api/public/team-members/[slug] | ✅ |
| GET /api/public/blog | GET /api/public/blog | ✅ |
| GET /api/public/blog/{slug} | GET /api/public/blog/[slug] | ✅ |
| POST /api/public/blog/{slug} | POST /api/public/blog/[slug] (view tracking) | ✅ |
| GET /api/public/gallery | GET /api/public/gallery | ✅ |
| GET /api/public/gallery/random | GET /api/public/gallery/random | ✅ |
| GET /api/public/testimonials | GET /api/public/testimonials | ✅ |
| GET /api/public/slider | GET /api/public/slider | ✅ |
| POST /api/public/appointment-request | POST /api/public/appointment-request | ✅ |
| GET /api/public/clinic-rhythm/today | GET /api/public/clinic-rhythm/today | ✅ |
| GET /api/public/clinic-rhythm/latest | GET /api/public/clinic-rhythm/latest | ✅ |
| POST /api/public/feedback | POST /api/public/feedback | ✅ |
| GET /api/public/services-list | GET /api/public/services-list | ✅ |
| POST /api/contact | POST /api/contact | ✅ |

### Admin API Routes
| FastAPI Route | Next.js Route | Status |
|--------------|---------------|--------|
| GET/POST /api/admin/users | GET/POST /api/admin/users | ✅ |
| GET/PUT /api/admin/users/{id} | GET/PUT /api/admin/users/[userId] | ✅ |
| POST /api/admin/users/{id}/reset-password | POST /api/admin/users/[userId]/reset-password | ✅ |
| POST /api/admin/users/{id}/deactivate | POST /api/admin/users/[userId]/deactivate | ✅ |
| POST /api/admin/users/{id}/activate | POST /api/admin/users/[userId]/activate | ✅ |
| GET/PUT /api/admin/settings | GET/PUT /api/admin/settings | ✅ |
| GET /api/admin/audit-logs | GET /api/admin/audit-logs | ✅ |
| GET/POST /api/admin/services | GET/POST /api/admin/services | ✅ |
| GET/PUT/DELETE /api/admin/services/{id} | GET/PUT/DELETE /api/admin/services/[serviceId] | ✅ |
| PATCH /api/admin/services/{id}/status | PATCH /api/admin/services/[serviceId]/status | ✅ |
| POST /api/admin/services/{id}/restore | POST /api/admin/services/[serviceId]/restore | ✅ |
| PATCH /api/admin/services/reorder | PATCH /api/admin/services/reorder | ✅ |
| GET/POST /api/admin/team-members | GET/POST /api/admin/team-members | ✅ |
| GET/PUT/DELETE /api/admin/team-members/{id} | GET/PUT/DELETE /api/admin/team-members/[memberId] | ✅ |
| GET/POST /api/admin/blog | GET/POST /api/admin/blog | ✅ |
| GET/PUT/DELETE /api/admin/blog/{id} | GET/PUT/DELETE /api/admin/blog/[postId] | ✅ |
| GET/POST /api/admin/blog-categories | GET/POST /api/admin/blog-categories | ✅ |
| GET/POST /api/admin/gallery | GET/POST /api/admin/gallery | ✅ |
| GET/PUT/DELETE /api/admin/gallery/{id} | GET/PUT/DELETE /api/admin/gallery/[albumId] | ✅ |
| POST /api/admin/gallery/{id}/items | POST /api/admin/gallery/[albumId]/items | ✅ |
| GET/POST /api/admin/testimonials | GET/POST /api/admin/testimonials | ✅ |
| GET/PUT/DELETE /api/admin/testimonials/{id} | GET/PUT/DELETE /api/admin/testimonials/[testimonialId] | ✅ |
| PATCH /api/admin/testimonials/{id}/status | PATCH /api/admin/testimonials/[testimonialId]/status | ✅ |
| GET /api/admin/testimonials/analytics | GET /api/admin/testimonials/analytics | ✅ |
| GET/POST /api/admin/crm/appointments | GET/POST /api/admin/crm/appointments | ✅ |
| GET/PUT /api/admin/crm/appointments/{id} | GET/PUT /api/admin/crm/appointments/[appointmentId] | ✅ |
| PATCH /api/admin/crm/appointments/{id}/status | PATCH /api/admin/crm/appointments/[appointmentId]/status | ✅ |
| POST /api/admin/crm/appointments/{id}/notes | POST /api/admin/crm/appointments/[appointmentId]/notes | ✅ |
| GET /api/admin/crm/stats | GET /api/admin/crm/stats | ✅ |
| GET/POST /api/admin/slider | GET/POST /api/admin/slider | ✅ |
| GET/PUT/DELETE /api/admin/slider/{id} | GET/PUT/DELETE /api/admin/slider/[slideId] | ✅ |
| GET/PUT /api/admin/slider/settings | GET/PUT /api/admin/slider/settings | ✅ |
| GET/POST /api/admin/clinic-rhythm | GET/POST /api/admin/clinic-rhythm | ✅ |
| GET/PUT/DELETE /api/admin/clinic-rhythm/{id} | GET/PUT/DELETE /api/admin/clinic-rhythm/[entryId] | ✅ |
| GET /api/admin/contact/messages | GET /api/admin/contact/messages | ✅ |
| GET /api/admin/contact/messages/stats | GET /api/admin/contact/messages/stats | ✅ |
| GET/DELETE /api/admin/contact/messages/{id} | GET/DELETE /api/admin/contact/messages/[messageId] | ✅ |
| PUT /api/admin/contact/messages/{id}/status | PUT /api/admin/contact/messages/[messageId]/status | ✅ |
| GET /api/admin/dashboard | GET /api/admin/dashboard | ✅ |
| GET /api/admin/dashboard/stats | GET /api/admin/dashboard/stats | ✅ |
| GET /api/admin/gallery/stats | GET /api/admin/gallery/stats | ✅ |
| POST /api/admin/uploads | POST /api/admin/uploads | ✅ |
| GET /api/uploads/{path} | GET /api/uploads/[...path] | ✅ |
| GET /api/admin/ai-usage | GET /api/admin/ai-usage | ✅ |
| POST /api/admin/ai-blog/generate | POST /api/admin/ai-blog/generate | ✅ (disabled) |
| POST /api/admin/ai-image/generate | POST /api/admin/ai-image/generate | ✅ (disabled) |

## Environment Variables

### Required Variables
```env
# Database (REQUIRED)
MONGO_URL=mongodb://your-mongodb-url
DB_NAME=wetnose_db

# JWT Secrets (REQUIRED - change in production!)
JWT_SECRET=your-secure-jwt-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret

# App Environment
APP_ENV=production  # or 'preview' for staging
```

### Admin Credentials
```env
# For Production - Initial Admin
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
INITIAL_ADMIN_PASSWORD=secure-password

# For Staging/Preview Only
STAGE_ADMIN_EMAIL=admin@wetnose.com
STAGE_ADMIN_PASSWORD=WetNose2024!

# Hidden Support Admin (optional)
SUPPORT_ADMIN_EMAIL=support@yourdomain.com
SUPPORT_ADMIN_PASSWORD=support-password
```

### Optional Variables
```env
# Cookie Settings
COOKIE_SECURE=true  # Set to true in production
COOKIE_DOMAIN=.yourdomain.com

# Uploads
UPLOAD_DIR=/app/storage/uploads

# AI Features (optional)
OPENAI_API_KEY=sk-...
# or
EMERGENT_LLM_KEY=...
```

## Deployment Checklist

### Pre-Deployment
- [ ] Set secure JWT_SECRET and JWT_REFRESH_SECRET (use long random strings)
- [ ] Configure MONGO_URL to your production MongoDB
- [ ] Set APP_ENV=production
- [ ] Set COOKIE_SECURE=true
- [ ] Configure INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD
- [ ] Ensure storage/uploads directory is writable

### Build & Deploy
```bash
# Build the application
yarn build

# Start production server
yarn start
```

### Post-Deployment Verification
- [ ] Homepage loads at /
- [ ] Static assets (_next/static/*) load correctly
- [ ] Admin login works at /admin/login
- [ ] Admin dashboard loads at /admin
- [ ] API endpoints respond correctly
- [ ] File uploads work
- [ ] MongoDB connection is stable

## Database Compatibility
- MongoDB schema remains **unchanged**
- All collection names preserved
- No breaking changes to existing data
- Compatible with the existing production database

## Key Features
- ✅ Full-stack Next.js 14+ with App Router
- ✅ Server-side API routes (replaces FastAPI)
- ✅ MongoDB integration with native driver
- ✅ JWT authentication with refresh tokens
- ✅ Rate limiting on sensitive endpoints
- ✅ File uploads with dedicated storage
- ✅ Admin panel with full CRUD operations
- ✅ CRM for appointment management
- ✅ AI features (optional, behind feature flag)
- ✅ Static asset serving (_next/static)
- ✅ Turkish language UI

## Notes
- AI blog/image generation is disabled by default (returns 503)
- Configure OPENAI_API_KEY or EMERGENT_LLM_KEY to enable AI features
- Rate limiting uses in-memory store (consider Redis for production)
