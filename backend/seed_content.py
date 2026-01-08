"""
Seed script for Wetnose Veterinary Clinic
Creates sample data for services, team, blog, and gallery
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
import uuid
import shutil
from pathlib import Path

# Sample Services Data
SERVICES_DATA = [
    {
        "id": str(uuid.uuid4()),
        "title": "Genel Muayene",
        "slug": "genel-muayene",
        "description": "Kapsamlı sağlık kontrolü ve muayene hizmetleri",
        "content": """Evcil hayvanınızın genel sağlık durumunu değerlendirmek için kapsamlı muayene hizmeti sunuyoruz. 

Muayene sırasında:
- Fiziksel muayene
- Kalp ve akciğer dinleme
- Göz, kulak ve diş kontrolü
- Kilo ve vücut kondisyonu değerlendirmesi
- Aşı takvimi kontrolü

Düzenli muayeneler, hastalıkların erken teşhisi için çok önemlidir.""",
        "image_url": "/images/services/1579154204601-01588f351e67.webp",
        "icon": "Stethoscope",
        "is_active": True,
        "is_featured": True,
        "sort_order": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Aşılama",
        "slug": "asilama",
        "description": "Koruyucu aşı uygulamaları ve bağışıklık takibi",
        "content": """Evcil hayvanınızı tehlikeli hastalıklardan korumak için düzenli aşılama programları uyguluyoruz.

Aşı programlarımız:
- Köpek karma aşısı
- Kuduz aşısı
- Kedi karma aşısı
- Lösemi aşısı
- Kennel öksürüğü aşısı

Aşı takviminizi düzenli tutarak dostunuzun sağlığını koruyun.""",
        "image_url": "/images/services/1559757148-5c350d0d3c56.webp",
        "icon": "Syringe",
        "is_active": True,
        "is_featured": True,
        "sort_order": 2,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Cerrahi Operasyonlar",
        "slug": "cerrahi-operasyonlar",
        "description": "Modern ameliyathane ve deneyimli cerrahi ekip",
        "content": """Tam donanımlı ameliyathanemizde her türlü cerrahi müdahaleyi gerçekleştiriyoruz.

Cerrahi hizmetlerimiz:
- Kısırlaştırma operasyonları
- Tümör ve kitle alımları
- Ortopedik cerrahi
- Göz cerrahisi
- Diş cerrahisi
- Acil cerrahi müdahaleler

Ameliyat öncesi ve sonrası kapsamlı bakım hizmeti sunuyoruz.""",
        "image_url": "/images/services/1628009368231-7bb7cfcb0def.webp",
        "icon": "Scissors",
        "is_active": True,
        "is_featured": True,
        "sort_order": 3,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Laboratuvar Hizmetleri",
        "slug": "laboratuvar-hizmetleri",
        "description": "Kan, idrar ve dışkı analizleri",
        "content": """Modern laboratuvarımızda hızlı ve güvenilir test sonuçları alabilirsiniz.

Laboratuvar testlerimiz:
- Tam kan sayımı
- Biyokimya paneli
- İdrar analizi
- Dışkı parazit taraması
- Hormon testleri
- Enfeksiyon testleri

Sonuçlar genellikle aynı gün içinde hazır olmaktadır.""",
        "image_url": "/images/services/1612531386530-97286d97c2d2.webp",
        "icon": "FlaskConical",
        "is_active": True,
        "is_featured": False,
        "sort_order": 4,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Görüntüleme",
        "slug": "goruntuleme",
        "description": "Röntgen, ultrason ve diğer görüntüleme hizmetleri",
        "content": """Gelişmiş görüntüleme cihazlarımızla doğru teşhis koyuyoruz.

Görüntüleme hizmetlerimiz:
- Dijital röntgen
- Ultrasonografi
- Ekokardiyografi
- Dental röntgen

Görüntüleme sonuçları anında değerlendirilir ve size detaylı bilgi verilir.""",
        "image_url": "/images/services/1516734212186-a967f81ad0d7.webp",
        "icon": "ScanLine",
        "is_active": True,
        "is_featured": False,
        "sort_order": 5,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Diş Bakımı",
        "slug": "dis-bakimi",
        "description": "Diş temizliği, çekim ve ağız sağlığı",
        "content": """Evcil hayvanınızın ağız ve diş sağlığı için kapsamlı hizmetler sunuyoruz.

Diş bakım hizmetlerimiz:
- Diş taşı temizliği
- Diş çekimi
- Ağız muayenesi
- Diş fırçalama eğitimi
- Periodontal tedavi

Düzenli diş bakımı, genel sağlık için çok önemlidir.""",
        "image_url": "/images/services/1551717743-49959800b1f6.webp",
        "icon": "Sparkles",
        "is_active": True,
        "is_featured": False,
        "sort_order": 6,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

# Sample Team Data
TEAM_DATA = [
    {
        "id": str(uuid.uuid4()),
        "name": "Dr. Ahmet Yılmaz",
        "slug": "dr-ahmet-yilmaz",
        "title": "Baş Veteriner Hekim",
        "bio": "15 yıllık deneyime sahip uzman veteriner hekim. İstanbul Üniversitesi Veteriner Fakültesi mezunu. Cerrahi ve iç hastalıkları konusunda uzmanlaşmıştır.",
        "image_url": "/images/team/veteriner-1.jpg",
        "specializations": ["Cerrahi", "İç Hastalıkları", "Onkoloji"],
        "education": ["İstanbul Üniversitesi Veteriner Fakültesi", "Cerrahi Uzmanlık - Ankara Üniversitesi"],
        "email": "ahmet.yilmaz@wetnose.com.tr",
        "phone": "+90 553 484 54 24",
        "is_active": True,
        "sort_order": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Dr. Elif Demir",
        "slug": "dr-elif-demir",
        "title": "Veteriner Hekim",
        "bio": "Özellikle küçük hayvanların dermatolojisi ve beslenme danışmanlığı konularında uzman. Hayvan sevgisiyle dolu, şefkatli bir yaklaşım sergiler.",
        "image_url": "/images/team/veteriner-2.jpg",
        "specializations": ["Dermatoloji", "Beslenme", "Koruyucu Hekimlik"],
        "education": ["Uludağ Üniversitesi Veteriner Fakültesi"],
        "email": "elif.demir@wetnose.com.tr",
        "phone": "+90 553 484 54 24",
        "is_active": True,
        "sort_order": 2,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Dr. Mehmet Kaya",
        "slug": "dr-mehmet-kaya",
        "title": "Veteriner Hekim",
        "bio": "Ortopedi ve travmatoloji alanında uzmanlaşmış genç ve dinamik veteriner hekim. Acil vakalarda hızlı ve etkili müdahale konusunda deneyimli.",
        "image_url": "/images/team/veteriner-3.jpg",
        "specializations": ["Ortopedi", "Travmatoloji", "Acil Müdahale"],
        "education": ["Selçuk Üniversitesi Veteriner Fakültesi", "Ortopedi Sertifikası"],
        "email": "mehmet.kaya@wetnose.com.tr",
        "phone": "+90 553 484 54 24",
        "is_active": True,
        "sort_order": 3,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

# Sample Blog Posts
BLOG_DATA = [
    {
        "id": str(uuid.uuid4()),
        "title": "Evcil Hayvanınızın Aşı Takvimi",
        "slug": "evcil-hayvaninizin-asi-takvimi",
        "excerpt": "Köpek ve kedilerin hangi aşıları ne zaman yaptırması gerektiğini öğrenin.",
        "content": """Evcil hayvanlarımızın sağlığını korumak için düzenli aşılama çok önemlidir. İşte bilmeniz gereken her şey:

## Köpekler İçin Aşı Takvimi

### Yavru Köpekler (6-16 hafta)
- 6-8 hafta: İlk karma aşı
- 10-12 hafta: İkinci karma aşı
- 14-16 hafta: Üçüncü karma aşı + kuduz aşısı

### Yetişkin Köpekler
- Yıllık karma aşı rapeli
- 3 yılda bir kuduz aşısı

## Kediler İçin Aşı Takvimi

### Yavru Kediler
- 8 hafta: İlk karma aşı
- 12 hafta: İkinci karma aşı
- 16 hafta: Kuduz aşısı

### Yetişkin Kediler
- Yıllık karma aşı rapeli
- 3 yılda bir kuduz aşısı

Düzenli aşılama ile dostunuzu tehlikeli hastalıklardan koruyabilirsiniz.""",
        "featured_image": "/images/blog/asi-takvimi.jpg",
        "category": "Sağlık",
        "tags": ["aşı", "sağlık", "koruyucu hekimlik"],
        "status": "published",
        "is_featured": True,
        "view_count": 156,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "published_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Kedi ve Köpeklerde Beslenme Rehberi",
        "slug": "kedi-ve-kopeklerde-beslenme-rehberi",
        "excerpt": "Evcil hayvanınız için doğru beslenme programı nasıl oluşturulur?",
        "content": """Sağlıklı bir yaşam için doğru beslenme şarttır. İşte evcil hayvanınız için beslenme ipuçları:

## Köpekler İçin Beslenme

### Yavru Köpekler
- Günde 3-4 öğün
- Yavru köpek maması tercih edin
- Temiz su her zaman ulaşılabilir olmalı

### Yetişkin Köpekler
- Günde 2 öğün
- Kiloya uygun porsiyon
- Kaliteli protein kaynakları

## Kediler İçin Beslenme

### Yavru Kediler
- Günde 3-4 öğün küçük porsiyonlar
- Yavru kedi maması

### Yetişkin Kediler
- Günde 2 öğün veya serbest besleme
- Yaş ve kuru mama dengesi

## Kaçınılması Gereken Yiyecekler
- Çikolata
- Soğan ve sarımsak
- Üzüm ve kuru üzüm
- Kafein içeren içecekler""",
        "featured_image": "/images/blog/beslenme.jpg",
        "category": "Beslenme",
        "tags": ["beslenme", "mama", "sağlık"],
        "status": "published",
        "is_featured": False,
        "view_count": 89,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "published_at": datetime.now(timezone.utc).isoformat()
    }
]

# Gallery Albums and Items
GALLERY_DATA = {
    "albums": [
        {
            "id": "album-klinik",
            "title": "Klinik",
            "slug": "klinik",
            "description": "Modern kliniğimiz ve tesislerimiz",
            "status": "active",
            "sort_order": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "album-hastalar",
            "title": "Mutlu Hastalarımız",
            "slug": "mutlu-hastalarimiz",
            "description": "Tedavi ettiğimiz sevimli dostlarımız",
            "status": "active",
            "sort_order": 2,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ],
    "items": [
        {
            "id": str(uuid.uuid4()),
            "album_id": "album-klinik",
            "image_url": "/images/gallery/klinik-1.jpg",
            "image_alt": "Modern muayene odası",
            "caption": "Modern muayene odamız",
            "sort_order": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "album_id": "album-klinik",
            "image_url": "/images/gallery/klinik-2.jpg",
            "image_alt": "Ameliyathane",
            "caption": "Tam donanımlı ameliyathanemiz",
            "sort_order": 2,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "album_id": "album-hastalar",
            "image_url": "/images/gallery/hasta-1.jpg",
            "image_alt": "Mutlu köpek",
            "caption": "Tedavi sonrası mutlu dostumuz",
            "sort_order": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
}


async def seed_data():
    """Seed all data to database"""
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
    db = client[os.environ.get('DB_NAME', 'wetnose')]
    
    print("🌱 WETNOSE Data Seed Script")
    print("=" * 50)
    
    # Seed Services
    print("\n📋 Seeding Services...")
    existing_services = await db.services.count_documents({})
    if existing_services == 0:
        result = await db.services.insert_many(SERVICES_DATA)
        print(f"   ✓ Added {len(result.inserted_ids)} services")
    else:
        print(f"   ⏭ Skipping - {existing_services} services already exist")
    
    # Seed Team
    print("\n👥 Seeding Team Members...")
    existing_team = await db.team_members.count_documents({})
    if existing_team == 0:
        result = await db.team_members.insert_many(TEAM_DATA)
        print(f"   ✓ Added {len(result.inserted_ids)} team members")
    else:
        print(f"   ⏭ Skipping - {existing_team} team members already exist")
    
    # Seed Blog
    print("\n📝 Seeding Blog Posts...")
    existing_blog = await db.blog_posts.count_documents({})
    if existing_blog == 0:
        result = await db.blog_posts.insert_many(BLOG_DATA)
        print(f"   ✓ Added {len(result.inserted_ids)} blog posts")
    else:
        print(f"   ⏭ Skipping - {existing_blog} blog posts already exist")
    
    # Seed Gallery
    print("\n🖼 Seeding Gallery...")
    existing_albums = await db.gallery_albums.count_documents({})
    if existing_albums == 0:
        await db.gallery_albums.insert_many(GALLERY_DATA["albums"])
        await db.gallery_items.insert_many(GALLERY_DATA["items"])
        print(f"   ✓ Added {len(GALLERY_DATA['albums'])} albums and {len(GALLERY_DATA['items'])} images")
    else:
        print(f"   ⏭ Skipping - {existing_albums} albums already exist")
    
    print("\n" + "=" * 50)
    print("✅ Seed completed!")
    
    # Summary
    print("\n📊 Database Summary:")
    print(f"   Services: {await db.services.count_documents({})}")
    print(f"   Team Members: {await db.team_members.count_documents({})}")
    print(f"   Blog Posts: {await db.blog_posts.count_documents({})}")
    print(f"   Gallery Albums: {await db.gallery_albums.count_documents({})}")
    print(f"   Gallery Items: {await db.gallery_items.count_documents({})}")
    print(f"   Testimonials: {await db.testimonials.count_documents({})}")


if __name__ == "__main__":
    asyncio.run(seed_data())
