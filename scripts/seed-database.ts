/**
 * Idempotent Database Seed Script
 * 
 * This script populates the database with sample data for local/staging environments.
 * It's idempotent - running it multiple times won't create duplicates.
 * 
 * Usage: npx ts-node --esm scripts/seed-database.ts
 * Or: yarn seed
 */

import { MongoClient, Db } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'wetnose_db'

// Helper to generate deterministic IDs based on slug
function generateDeterministicId(prefix: string, slug: string): string {
  // Use a simple hash to make IDs deterministic
  const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `${prefix}-${slug}-${hash}`
}

async function seedServices(db: Db) {
  const collection = db.collection('services')
  const now = new Date()

  const services = [
    {
      id: generateDeterministicId('svc', 'laboratuvar'),
      title: 'Laboratuvar',
      slug: 'laboratuvar',
      short_description: 'Kocaeli\'nin en modern veteriner laboratuvarı ile tüm tetkikleriniz güvenle yapılmaktadır.',
      long_description: '<p>Wetnose Veteriner Kliniği olarak, modern laboratuvar altyapımız ile tüm kan, idrar ve dışkı tahlillerini kliniğimizde gerçekleştiriyoruz. Sonuçlarınızı aynı gün içinde alabilirsiniz.</p><h3>Hizmetlerimiz</h3><ul><li>Hemogram (Tam Kan Sayımı)</li><li>Biyokimya Paneli</li><li>İdrar Tahlili</li><li>Dışkı Analizi</li><li>Parazit Taraması</li></ul>',
      cover_image_url: '/images/services/1579154204601-01588f351e67.webp',
      cover_image_alt: 'Veteriner laboratuvar hizmeti',
      icon: 'flask',
      price_mode: 'contact',
      price_value: null,
      tags: ['laboratuvar', 'tetkik', 'kan tahlili'],
      category: 'Tanı',
      seo: { meta_title: 'Veteriner Laboratuvar | Wetnose', meta_description: 'Modern veteriner laboratuvar hizmetleri' },
      status: 'published',
      sort_order: 1,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('svc', 'radyoloji'),
      title: 'Radyoloji & Ultrason',
      slug: 'radyoloji',
      short_description: 'Wetnose İzmit Veteriner Kliniğinde tüm radyolojik incelemeler yapılmaktadır.',
      long_description: '<p>Dijital röntgen ve ultrason cihazlarımız ile dostlarınızın iç organlarını detaylı olarak inceleyebiliyoruz. Görüntüleme sonuçları anında değerlendirilir.</p>',
      cover_image_url: '/images/services/1559757148-5c350d0d3c56.webp',
      cover_image_alt: 'Veteriner radyoloji hizmeti',
      icon: 'scan',
      price_mode: 'contact',
      price_value: null,
      tags: ['radyoloji', 'ultrason', 'görüntüleme'],
      category: 'Tanı',
      seo: { meta_title: 'Radyoloji & Ultrason | Wetnose', meta_description: 'Veteriner radyoloji ve ultrason hizmetleri' },
      status: 'published',
      sort_order: 2,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('svc', 'acil-servis'),
      title: 'Acil Servis',
      slug: 'acil-servis',
      short_description: '7/24 acil veteriner hizmeti ile dostlarınız her zaman güvende.',
      long_description: '<p>Wetnose Veteriner Kliniği olarak 7 gün 24 saat acil veteriner hizmeti sunuyoruz. Acil durumlarda bizi arayabilir veya doğrudan kliniğimize gelebilirsiniz.</p><h3>Acil Durumlar</h3><ul><li>Travma ve kazalar</li><li>Zehirlenme</li><li>Solunum güçlüğü</li><li>Doğum komplikasyonları</li><li>Ciddi kanama</li></ul>',
      cover_image_url: '/images/services/1628009368231-7bb7cfcb0def.webp',
      cover_image_alt: 'Acil veteriner servisi',
      icon: 'ambulance',
      price_mode: 'contact',
      price_value: null,
      tags: ['acil', '7/24', 'ambulans'],
      category: 'Acil',
      seo: { meta_title: '7/24 Acil Veteriner Servisi | Wetnose', meta_description: '7 gün 24 saat acil veteriner hizmeti' },
      status: 'published',
      sort_order: 3,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('svc', 'genel-muayene'),
      title: 'Genel Muayene',
      slug: 'genel-muayene',
      short_description: 'Periyodik sağlık kontrolleri ile dostlarınızın sağlığını takip edin.',
      long_description: '<p>Düzenli sağlık kontrolleri, hastalıkların erken teşhisinde büyük önem taşır. Yılda en az iki kez check-up yaptırmanızı öneriyoruz.</p>',
      cover_image_url: '/images/services/1516734212186-a967f81ad0d7.webp',
      cover_image_alt: 'Genel veteriner muayenesi',
      icon: 'stethoscope',
      price_mode: 'from',
      price_value: 250,
      tags: ['muayene', 'check-up', 'kontrol'],
      category: 'Genel',
      seo: { meta_title: 'Genel Muayene | Wetnose', meta_description: 'Veteriner genel muayene ve check-up hizmetleri' },
      status: 'published',
      sort_order: 4,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('svc', 'cerrahi'),
      title: 'Genel Cerrahi',
      slug: 'cerrahi',
      short_description: 'Deneyimli cerrah kadromuzla tüm cerrahi operasyonlar güvenle gerçekleştirilir.',
      long_description: '<p>Modern ameliyathane ve anestezi ekipmanlarımız ile tüm cerrahi operasyonları güvenle gerçekleştiriyoruz. Kısırlaştırma, tümör alımı ve ortopedik ameliyatlar başlıca uzmanlık alanlarımızdandır.</p>',
      cover_image_url: '/images/services/1551717743-49959800b1f6.webp',
      cover_image_alt: 'Veteriner cerrahi operasyonu',
      icon: 'scissors',
      price_mode: 'contact',
      price_value: null,
      tags: ['cerrahi', 'ameliyat', 'operasyon'],
      category: 'Cerrahi',
      seo: { meta_title: 'Veteriner Cerrahi | Wetnose', meta_description: 'Profesyonel veteriner cerrahi hizmetleri' },
      status: 'published',
      sort_order: 5,
      created_at: now,
      updated_at: now
    }
  ]

  for (const service of services) {
    const exists = await collection.findOne({ id: service.id })
    if (!exists) {
      await collection.insertOne(service)
      console.log(`✓ Created service: ${service.title}`)
    } else {
      console.log(`→ Service exists: ${service.title}`)
    }
  }
}

async function seedTeamMembers(db: Db) {
  const collection = db.collection('team_members')
  const now = new Date()

  const members = [
    {
      id: generateDeterministicId('team', 'hasan-murat-turkan'),
      full_name: 'Hasan Murat Türkan',
      slug: 'hasan-murat-turkan',
      role_title: 'Kurucu Veteriner Hekim',
      department: 'Yönetim',
      specialties: ['Genel Cerrahi', 'Ortopedi', 'Yoğun Bakım'],
      bio: '<p>Wetnose Veteriner Kliniği kurucusu olarak 15 yılı aşkın deneyimimle dostlarınıza en iyi hizmeti sunmak için çalışıyorum. İstanbul Üniversitesi Veteriner Fakültesi mezunuyum.</p>',
      short_bio: 'Klinik kurucusu, 15+ yıl deneyim',
      photo_url: '/images/team/hasan-murat.png',
      photo_alt: 'Dr. Hasan Murat Türkan',
      email: 'hasan.murat@wetnose.com.tr',
      phone: '0553 484 54 24',
      social_links: { instagram: 'https://instagram.com/wetnoseveteriner' },
      experience: '15+ Yıl Deneyim',
      experience_years: 15,
      quote: 'Dostlarınızın sağlığı, bizim önceliğimiz.',
      education: ['İstanbul Üniversitesi Veteriner Fakültesi'],
      certifications: ['Türk Veteriner Hekimleri Birliği'],
      working_schedule: 'Pazartesi - Cumartesi',
      accepts_appointments: true,
      is_owner: true,
      is_featured: true,
      show_contact_info: true,
      status: 'published',
      sort_order: 1,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('team', 'cihat-ekinci'),
      full_name: 'Cihat Ekinci',
      slug: 'cihat-ekinci',
      role_title: 'Kurucu Veteriner Hekim',
      department: 'Yönetim',
      specialties: ['Dahiliye', 'Radyoloji', 'Ultrasonografi'],
      bio: '<p>Wetnose Veteriner Kliniği kurucu ortağı olarak, dahiliye ve görüntüleme alanlarında uzmanlaştım. Ankara Üniversitesi Veteriner Fakültesi mezunuyum.</p>',
      short_bio: 'Klinik kurucusu, dahiliye uzmanı',
      photo_url: '/images/team/cihat-ekinci.png',
      photo_alt: 'Dr. Cihat Ekinci',
      email: 'cihat.ekinci@wetnose.com.tr',
      phone: '0544 938 66 73',
      social_links: { instagram: 'https://instagram.com/wetnoseveteriner' },
      experience: '12+ Yıl Deneyim',
      experience_years: 12,
      quote: 'Her patili dost özel ilgiyi hak eder.',
      education: ['Ankara Üniversitesi Veteriner Fakültesi'],
      certifications: ['Türk Veteriner Hekimleri Birliği'],
      working_schedule: 'Pazartesi - Cumartesi',
      accepts_appointments: true,
      is_owner: true,
      is_featured: true,
      show_contact_info: true,
      status: 'published',
      sort_order: 2,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('team', 'elif-kaya'),
      full_name: 'Elif Kaya',
      slug: 'elif-kaya',
      role_title: 'Veteriner Hekim',
      department: 'Klinik',
      specialties: ['Dermatoloji', 'Alerji', 'Küçük Hayvan'],
      bio: '<p>Dermatoloji ve alerji konularında uzmanlaşmış veteriner hekimim. Cilt problemleri ve alerjik reaksiyonların tedavisinde deneyimliyim.</p>',
      short_bio: 'Dermatoloji uzmanı',
      photo_url: '/images/team/1559839734-2b71ea197ec2.webp',
      photo_alt: 'Dr. Elif Kaya',
      email: null,
      phone: null,
      social_links: {},
      experience: '5+ Yıl Deneyim',
      experience_years: 5,
      quote: 'Sağlıklı bir deri, mutlu bir dost demektir.',
      education: ['Uludağ Üniversitesi Veteriner Fakültesi'],
      certifications: [],
      working_schedule: 'Pazartesi - Cuma',
      accepts_appointments: true,
      is_owner: false,
      is_featured: false,
      show_contact_info: false,
      status: 'published',
      sort_order: 3,
      created_at: now,
      updated_at: now
    }
  ]

  for (const member of members) {
    const exists = await collection.findOne({ id: member.id })
    if (!exists) {
      await collection.insertOne(member)
      console.log(`✓ Created team member: ${member.full_name}`)
    } else {
      console.log(`→ Team member exists: ${member.full_name}`)
    }
  }
}

async function seedBlogPosts(db: Db) {
  const collection = db.collection('blog_posts')
  const now = new Date()

  const posts = [
    {
      id: generateDeterministicId('blog', 'kedi-beslenmesi-rehberi'),
      title: 'Kedi Beslenmesi Rehberi: Sağlıklı Beslenme İpuçları',
      slug: 'kedi-beslenmesi-rehberi',
      excerpt: 'Kedinizin sağlıklı ve mutlu bir yaşam sürmesi için doğru beslenme çok önemlidir. Bu rehberde kedi beslenmesi hakkında bilmeniz gereken her şeyi bulabilirsiniz.',
      cover_image_url: '/images/general/1514888286974-6c03e2ca1dba.webp',
      cover_image_alt: 'Sağlıklı kedi beslenmesi',
      content: '<h2>Kediler İçin Dengeli Beslenme</h2><p>Kediler obligat karnivorlerdir, yani et yemeye zorunlu hayvanlardır. Diyetlerinin büyük çoğunluğu hayvansal proteinden oluşmalıdır.</p><h3>Temel Besin Gereksinimleri</h3><ul><li><strong>Protein:</strong> Kas gelişimi ve genel sağlık için gereklidir</li><li><strong>Taurin:</strong> Kalp ve göz sağlığı için kritik bir amino asit</li><li><strong>Yağlar:</strong> Enerji kaynağı ve derinin sağlığı için</li><li><strong>Vitaminler:</strong> A, D, E ve K vitaminleri</li></ul><h3>Beslenme Sıklığı</h3><p>Yetişkin kediler günde 2-3 öğün beslenmelidir. Yavru kediler daha sık, günde 4-5 öğün beslenmelidir.</p>',
      category: 'Beslenme',
      tags: ['kedi', 'beslenme', 'sağlık', 'mama'],
      seo: { meta_title: 'Kedi Beslenmesi Rehberi | Wetnose Veteriner', meta_description: 'Kediniz için en iyi beslenme tavsiyeleri ve sağlıklı mama seçimi.' },
      status: 'published',
      published_at: now,
      ai_generated: false,
      view_count: 245,
      reading_time: 5,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('blog', 'kopek-asi-takvimi'),
      title: 'Köpek Aşı Takvimi: Hangi Aşı Ne Zaman?',
      slug: 'kopek-asi-takvimi',
      excerpt: 'Köpeğinizin sağlığını korumak için düzenli aşılama çok önemlidir. Bu yazıda köpek aşı takvimi hakkında detaylı bilgi bulabilirsiniz.',
      cover_image_url: '/images/blog/1587300003388-59208cc962cb.webp',
      cover_image_alt: 'Köpek aşı uygulaması',
      content: '<h2>Köpek Aşı Programı</h2><p>Düzenli aşılama, köpeğinizi ciddi hastalıklardan korur.</p><h3>Yavru Köpek Aşıları</h3><ul><li><strong>6-8 Hafta:</strong> İlk karma aşı</li><li><strong>10-12 Hafta:</strong> Karma aşı tekrarı</li><li><strong>14-16 Hafta:</strong> Karma aşı + Kuduz</li></ul><h3>Yetişkin Köpek Aşıları</h3><p>Yetişkin köpeklerde yıllık aşı tekrarları yapılmalıdır. Kuduz aşısı yasal zorunluluktur.</p>',
      category: 'Aşı',
      tags: ['köpek', 'aşı', 'sağlık', 'koruyucu tıp'],
      seo: { meta_title: 'Köpek Aşı Takvimi | Wetnose Veteriner', meta_description: 'Köpekler için aşı takvimi ve önemli aşı bilgileri.' },
      status: 'published',
      published_at: now,
      ai_generated: false,
      view_count: 189,
      reading_time: 4,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('blog', 'dis-sagligi-onemi'),
      title: 'Evcil Hayvan Diş Sağlığı: Neden Önemli?',
      slug: 'dis-sagligi-onemi',
      excerpt: 'Diş sağlığı evcil hayvanların genel sağlığını doğrudan etkiler. Diş problemleri ciddi sağlık sorunlarına yol açabilir.',
      cover_image_url: '/images/blog/1583337130417-e658ffcbd593.webp',
      cover_image_alt: 'Veteriner diş muayenesi',
      content: '<h2>Diş Sağlığının Önemi</h2><p>Diş problemleri sadece ağız içiyle sınırlı kalmaz, kalp ve böbrek gibi organları da etkileyebilir.</p><h3>Diş Hastalıklarının Belirtileri</h3><ul><li>Ağız kokusu</li><li>Yemek yemede isteksizlik</li><li>Dişeti kanaması</li><li>Diş taşı birikimi</li></ul>',
      category: 'Bakım',
      tags: ['diş sağlığı', 'bakım', 'önleyici sağlık'],
      seo: { meta_title: 'Evcil Hayvan Diş Sağlığı | Wetnose Veteriner', meta_description: 'Evcil hayvanınızın diş sağlığını korumak için önemli bilgiler.' },
      status: 'published',
      published_at: now,
      ai_generated: false,
      view_count: 156,
      reading_time: 3,
      created_at: now,
      updated_at: now
    },
    {
      id: generateDeterministicId('blog', 'yaz-sicaklarinda-evcil-hayvan'),
      title: 'Yaz Sıcaklarında Evcil Hayvan Bakımı',
      slug: 'yaz-sicaklarinda-evcil-hayvan',
      excerpt: 'Sıcak yaz günlerinde evcil hayvanlarınızı sıcak çarpmasından korumak için dikkat etmeniz gereken önemli noktalar.',
      cover_image_url: '/images/general/1450778869180-41d0601e046e.webp',
      cover_image_alt: 'Yazın evcil hayvan bakımı',
      content: '<h2>Yaz Mevsiminde Dikkat Edilecekler</h2><p>Yaz aylarında evcil hayvanlarımız sıcak çarpması riskiyle karşı karşıyadır.</p><h3>Öneriler</h3><ul><li>Her zaman taze su bulundurun</li><li>Gün ortasında gezinti yapmaktan kaçının</li><li>Aracınızda yalnız bırakmayın</li><li>Serin gölgelik alanlar sağlayın</li></ul>',
      category: 'Mevsimsel',
      tags: ['yaz', 'sıcak', 'bakım', 'koruma'],
      seo: { meta_title: 'Yaz Sıcaklarında Evcil Hayvan Bakımı | Wetnose', meta_description: 'Yaz aylarında evcil hayvanınızı sıcaktan koruma ipuçları.' },
      status: 'published',
      published_at: now,
      ai_generated: false,
      view_count: 203,
      reading_time: 4,
      created_at: now,
      updated_at: now
    }
  ]

  for (const post of posts) {
    const exists = await collection.findOne({ id: post.id })
    if (!exists) {
      await collection.insertOne(post)
      console.log(`✓ Created blog post: ${post.title}`)
    } else {
      console.log(`→ Blog post exists: ${post.title}`)
    }
  }
}

async function seedClinicRhythm(db: Db) {
  const collection = db.collection('clinic_rhythm')
  const now = new Date()
  
  // Get today's date key in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  const rhythm = {
    id: generateDeterministicId('rhythm', today),
    date_key: today,
    featured_question: {
      question_text: 'Kedim neden sürekli tüy döküyor?',
      short_answer: 'Kedilerde tüy dökümü mevsimsel olarak normaldir, ancak aşırı tüy dökümü beslenme eksikliği, stres veya deri hastalıklarının belirtisi olabilir. Düzenli tarama ve dengeli beslenme ile azaltılabilir.',
      related_blog_slug: 'kedi-beslenmesi-rehberi',
      related_blog_title: 'Kedi Beslenmesi Rehberi: Sağlıklı Beslenme İpuçları'
    },
    false_alarm: {
      message_title: 'Köpeğim ot yiyor, hasta mı?',
      message_body: 'Köpeklerin zaman zaman ot yemeleri genellikle normal bir davranıştır. Sindirim sistemlerini rahatlatmak veya bazı eksik mineralleri almak için yapabilirler.',
      supportive_line: 'Ancak çok sık veya aşırı miktarda ot yemesi durumunda veterinerinize danışmanızı öneririz.'
    },
    status: 'published',
    created_at: now,
    updated_at: now
  }

  const exists = await collection.findOne({ date_key: today })
  if (!exists) {
    await collection.insertOne(rhythm)
    console.log(`✓ Created clinic rhythm for: ${today}`)
  } else {
    console.log(`→ Clinic rhythm exists for: ${today}`)
  }
}

async function seedTestimonials(db: Db) {
  const collection = db.collection('testimonials')
  const now = new Date()

  const testimonials = [
    {
      id: generateDeterministicId('test', 'pamuk-sahibi'),
      full_name: 'Ayşe Yılmaz',
      email: 'ayse@example.com',
      pet_name: 'Pamuk',
      pet_type: 'Kedi',
      pet_photo_url: '/images/general/1514888286974-6c03e2ca1dba.webp',
      rating: 5,
      feedback_type: 'positive',
      comment: 'Pamuk\'un tedavisi için Wetnose ekibine çok teşekkür ederim. Profesyonel ve şefkatli yaklaşımları sayesinde minik dostumuz çok hızlı iyileşti.',
      consent_internal: true,
      consent_public: true,
      status: 'approved',
      submitted_at: now,
      approved_at: now,
      source: 'website',
      sort_order: 1
    },
    {
      id: generateDeterministicId('test', 'karamel-sahibi'),
      full_name: 'Mehmet Demir',
      email: 'mehmet@example.com',
      pet_name: 'Karamel',
      pet_type: 'Köpek',
      pet_photo_url: '/images/testimonials/1573865526739-10659fec78a5.webp',
      rating: 5,
      feedback_type: 'positive',
      comment: 'Karamel\'in ameliyatını başarıyla gerçekleştirdiler. 7/24 acil servis hizmeti hayat kurtarıcı oldu. Herkese tavsiye ederim!',
      consent_internal: true,
      consent_public: true,
      status: 'approved',
      submitted_at: now,
      approved_at: now,
      source: 'website',
      sort_order: 2
    },
    {
      id: generateDeterministicId('test', 'boncuk-sahibi'),
      full_name: 'Zeynep Kara',
      email: 'zeynep@example.com',
      pet_name: 'Boncuk',
      pet_type: 'Kedi',
      pet_photo_url: '/images/testimonials/1548199973-03cce0bbc87b.webp',
      rating: 5,
      feedback_type: 'positive',
      comment: 'Boncuk\'un yıllık kontrolleri için düzenli olarak Wetnose\'a geliyoruz. Hem fiyatları uygun hem de ekip çok ilgili.',
      consent_internal: true,
      consent_public: true,
      status: 'approved',
      submitted_at: now,
      approved_at: now,
      source: 'website',
      sort_order: 3
    }
  ]

  for (const testimonial of testimonials) {
    const exists = await collection.findOne({ id: testimonial.id })
    if (!exists) {
      await collection.insertOne(testimonial)
      console.log(`✓ Created testimonial: ${testimonial.pet_name}`)
    } else {
      console.log(`→ Testimonial exists: ${testimonial.pet_name}`)
    }
  }
}

async function seedGallery(db: Db) {
  const collection = db.collection('gallery_albums')
  const itemsCollection = db.collection('gallery_items')
  const now = new Date()

  const album = {
    id: generateDeterministicId('album', 'klinik-ve-dostlarimiz'),
    title: 'Klinik ve Dostlarımız',
    slug: 'klinik-ve-dostlarimiz',
    description: 'Wetnose Veteriner Kliniği ve mutlu patili dostlarımızdan kareler',
    cover_image_url: '/images/general/1450778869180-41d0601e046e.webp',
    status: 'published',
    sort_order: 1,
    created_at: now,
    updated_at: now
  }

  const albumExists = await collection.findOne({ id: album.id })
  if (!albumExists) {
    await collection.insertOne(album)
    console.log(`✓ Created gallery album: ${album.title}`)
  } else {
    console.log(`→ Gallery album exists: ${album.title}`)
  }

  const galleryItems = [
    { image_url: '/images/general/1450778869180-41d0601e046e.webp', image_alt: 'Klinik görünümü', caption: 'Modern kliniğimiz' },
    { image_url: '/images/blog/1583337130417-e658ffcbd593.webp', image_alt: 'Tedavi odası', caption: 'Tedavi odamız' },
    { image_url: '/images/blog/1587300003388-59208cc962cb.webp', image_alt: 'Mutlu köpek', caption: 'Tedavi sonrası mutlu dostumuz' },
    { image_url: '/images/general/1514888286974-6c03e2ca1dba.webp', image_alt: 'Kedi bakımı', caption: 'Nazik bakım' },
    { image_url: '/images/testimonials/1573865526739-10659fec78a5.webp', image_alt: 'Ameliyathane', caption: 'Modern ameliyathanemiz' },
    { image_url: '/images/testimonials/1548199973-03cce0bbc87b.webp', image_alt: 'Dış mekan', caption: 'Klinik dış görünümü' }
  ]

  for (let i = 0; i < galleryItems.length; i++) {
    const item = galleryItems[i]
    const itemId = generateDeterministicId('gitem', `item-${i}`)
    
    const exists = await itemsCollection.findOne({ id: itemId })
    if (!exists) {
      await itemsCollection.insertOne({
        id: itemId,
        album_id: album.id,
        ...item,
        sort_order: i + 1,
        created_at: now
      })
      console.log(`✓ Created gallery item: ${item.caption}`)
    } else {
      console.log(`→ Gallery item exists: ${item.caption}`)
    }
  }
}

async function main() {
  console.log('🌱 Starting database seed...\n')
  console.log(`📦 Database: ${DB_NAME}`)
  console.log(`🔗 URL: ${MONGO_URL.includes('localhost') ? 'localhost' : 'remote'}\n`)

  const client = new MongoClient(MONGO_URL)

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    console.log('--- Services ---')
    await seedServices(db)

    console.log('\n--- Team Members ---')
    await seedTeamMembers(db)

    console.log('\n--- Blog Posts ---')
    await seedBlogPosts(db)

    console.log('\n--- Clinic Rhythm ---')
    await seedClinicRhythm(db)

    console.log('\n--- Testimonials ---')
    await seedTestimonials(db)

    console.log('\n--- Gallery ---')
    await seedGallery(db)

    console.log('\n✅ Database seed completed!')

  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
