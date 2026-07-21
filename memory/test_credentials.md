# Test Credentials — Wetnose Veteriner Kliniği

## Admin Panel (URL: /admin/login)
| Rol | Email | Şifre |
|---|---|---|
| Admin | admin@wetnose.com.tr | WetnoseStage2026! |
| Klinik Yöneticisi (manager) | manager@wetnose.com.tr | Manager2026! |
| Resepsiyon (reception) | reception@wetnose.com.tr | Reception2026! |
| İçerik Editörü (editor) | editor@wetnose.com.tr | Editor2026! |

## Notes
- App: Next.js monolith, port 3000, tüm API'ler /api altında. PRODUCTION BUILD (kod değişikliğinde `yarn build` + `sudo supervisorctl restart frontend` gerekir).
- MongoDB: wetnose_db (MONGO_URL env).
- JWT secret'ları güçlü rastgele değerler (/app/.env).
- Rol matrisi: admin=herşey; manager=ops+content+settings+audit; reception=sadece ops (CRM+mesajlar); editor=sadece content.
