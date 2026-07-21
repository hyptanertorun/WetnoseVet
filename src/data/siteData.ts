// Wetnose Veteriner Kliniği Site Data
// NOT: İletişim bilgileri (telefon, WhatsApp, e-posta, adres, sosyal medya)
// tek kaynak olarak Admin Panel > Site Ayarları'ndan (DB settings) yönetilir.
// Bu dosyada iletişim verisi TUTULMAZ. Bkz: src/hooks/useSiteSettings.ts

export const siteInfo = {
  name: "WETNOSE",
  tagline: "Veteriner Kliniği",
  slogan: "DOSTLARIMIZA ÇOK FAZLA DEĞER VERİYORUZ",
  description: "Wetnose Veteriner Kliniği aracılığı ile minik dostlarımıza mutlu bir yuva ve aile arıyoruz."
};

export const navLinks = [
  { name: "Hakkımızda", href: "/hakkimizda" },
  { name: "Ekibimiz", href: "/ekibimiz" },
  { name: "Hizmetlerimiz", href: "/hizmetler" },
  { name: "Sağlık Rehberi", href: "/saglik-rehberi" },
  { name: "İletişim", href: "/iletisim" },
];

export const heroSlides = [
  {
    id: 1,
    image: "/images/slider/slider1.png",
    title: "Dostlarınıza Özel Bakım",
    subtitle: "Modern teknoloji ile sağlık takibi"
  },
  {
    id: 2,
    image: "/images/slider/slider2.png",
    title: "Uzman Veteriner Ekibi",
    subtitle: "7/24 Acil Veteriner Hizmeti"
  },
  {
    id: 3,
    image: "/images/slider/slider1.png",
    title: "Minik Dostlarınız Güvende",
    subtitle: "Profesyonel sağlık hizmetleri"
  }
];

export const services = [
  {
    id: 1,
    name: "LABORATUVAR",
    title: "Laboratuvar",
    slug: "laboratuvar",
    description: "Kocaeli'nin en modern veteriner laboratuvarı ile tüm tetkikleriniz güvenle yapılmaktadır.",
    icon: "flask",
    image: "/images/services/1579154204601-01588f351e67.webp"
  },
  {
    id: 2,
    name: "RADYOLOJİ",
    title: "Radyoloji & Ultrason",
    slug: "radyoloji",
    description: "Wetnose İzmit Veteriner Kliniğinde tüm radyolojik incelemeler yapılmaktadır.",
    icon: "scan",
    image: "/images/services/1559757148-5c350d0d3c56.webp"
  },
  {
    id: 3,
    name: "ACİL SERVİS",
    title: "Acil Servis",
    slug: "acil-servis",
    description: "7/24 acil veteriner hizmeti ile dostlarınız her zaman güvende.",
    icon: "ambulance",
    image: "/images/services/1628009368231-7bb7cfcb0def.webp"
  },
  {
    id: 4,
    name: "KAN TRANSFUZYONU",
    title: "Kan Transfüzyonu",
    slug: "kan-transfuzyonu",
    description: "Acil kan ihtiyacı durumlarında profesyonel kan transfüzyon hizmeti.",
    icon: "droplet",
    image: "/images/services/1612531386530-97286d97c2d2.webp"
  },
  {
    id: 5,
    name: "CHECK UP",
    title: "Genel Muayene",
    slug: "genel-muayene",
    description: "Periyodik sağlık kontrolleri ile dostlarınızın sağlığını takip edin.",
    icon: "stethoscope",
    image: "/images/services/1516734212186-a967f81ad0d7.webp"
  },
  {
    id: 6,
    name: "YOĞUNBAKIM",
    title: "Yoğun Bakım",
    slug: "yogun-bakim",
    description: "Modern yoğun bakım ünitesi ile 7/24 hasta takibi yapılmaktadır.",
    icon: "heart-pulse",
    image: "/images/services/1551717743-49959800b1f6.webp"
  },
  {
    id: 7,
    name: "GENEL CERRAHİ",
    title: "Genel Cerrahi",
    slug: "cerrahi",
    description: "Deneyimli cerrah kadromuzla tüm cerrahi operasyonlar güvenle gerçekleştirilir.",
    icon: "scissors",
    image: "/images/services/1551717743-49959800b1f6.webp"
  },
  {
    id: 8,
    name: "PET KUAFÖR",
    title: "Pet Kuaför",
    slug: "pet-kuafor",
    description: "Dostlarınızın bakımı ve güzelliği için profesyonel pet kuaför hizmeti.",
    icon: "sparkles",
    image: "/images/services/1516734212186-a967f81ad0d7.webp"
  }
];

// Klinik Sahipleri - Ön Planda Gösterilecek
export const clinicOwners = [
  {
    id: 1,
    name: "HASAN MURAT TÜRKAN",
    title: "Kurucu Veteriner Hekim",
    role: "Klinik Sahibi",
    image: "/images/team/hasan-murat.png",
    specialization: "Genel Cerrahi & Ortopedi",
    experience: "15+ Yıl Deneyim",
    quote: "Dostlarınızın sağlığı, bizim önceliğimiz."
  },
  {
    id: 2,
    name: "CİHAT EKİNCİ",
    title: "Kurucu Veteriner Hekim",
    role: "Klinik Sahibi",
    image: "/images/team/cihat-ekinci.png",
    specialization: "Dahiliye & Radyoloji",
    experience: "12+ Yıl Deneyim",
    quote: "Her patili dost özel ilgiyi hak eder."
  }
];

// Diğer Ekip Üyeleri
export const team = [
  {
    id: 1,
    name: "AYŞE YILMAZ",
    title: "Veteriner Hekim",
    image: "/images/team/1594824476967-48c8b964273f.webp",
    specialization: "Küçük Hayvan Cerrahisi"
  },
  {
    id: 2,
    name: "MEHMET KAYA",
    title: "Veteriner Hekim",
    image: "/images/team/1612349317150-e413f6a5b16d.webp",
    specialization: "Acil & Yoğun Bakım"
  },
  {
    id: 3,
    name: "ELİF ARSLAN",
    title: "Veteriner Hekim",
    image: "/images/team/1559839734-2b71ea197ec2.webp",
    specialization: "Dermatoloji & Alerji"
  },
  {
    id: 4,
    name: "CAN DEMİR",
    title: "Veteriner Teknisyeni",
    image: "/images/team/1537368910025-700350fe46c7.webp",
    specialization: "Laboratuvar & Görüntüleme"
  }
];

export const gallery = [
  {
    id: 1,
    image: "/images/general/1450778869180-41d0601e046e.webp",
    title: "Klinik Alanı"
  },
  {
    id: 2,
    image: "/images/blog/1583337130417-e658ffcbd593.webp",
    title: "Tedavi Odası"
  },
  {
    id: 3,
    image: "/images/blog/1587300003388-59208cc962cb.webp",
    title: "Mutlu Dostlar"
  },
  {
    id: 4,
    image: "/images/general/1514888286974-6c03e2ca1dba.webp",
    title: "Kedi Bakımı"
  },
  {
    id: 5,
    image: "/images/testimonials/1573865526739-10659fec78a5.webp",
    title: "Ameliyathane"
  },
  {
    id: 6,
    image: "/images/testimonials/1548199973-03cce0bbc87b.webp",
    title: "Dış Mekan"
  }
];

// HUD Data for Organ Overlay
export const hudDataGeneral = {
  title: "Genel Sağlık Durumu",
  stats: [
    { label: "Kalp Ritmi", value: "72 bpm" },
    { label: "Oksijen Seviyesi", value: "%99" },
    { label: "Sindirim Sağlığı", value: "Çok İyi" },
    { label: "Genel Sağlık", value: "Mükemmel" }
  ]
};

export const hudDataDigestion = {
  title: "Sindirim Sistemi Analizi",
  stats: [
    { label: "Sindirim Sistemi", value: "Çok İyi" },
    { label: "Bağırsak Dengesi", value: "Dengeli" },
    { label: "Emilim Oranı", value: "%97" },
    { label: "Genel Sağlık", value: "Mükemmel" }
  ]
};

export const scrollExperienceSteps = [
  {
    id: 1,
    title: "Karşılama",
    description: "Dostunuz kliniğimize geldiğinde sıcak bir karşılama ile başlıyoruz."
  },
  {
    id: 2,
    title: "İnceleme",
    description: "Detaylı fiziksel muayene ve ilk değerlendirme yapılır."
  },
  {
    id: 3,
    title: "Analiz",
    description: "Modern teknoloji ile kapsamlı sağlık taraması gerçekleştirilir."
  },
  {
    id: 4,
    title: "Sonuç",
    description: "Detaylı sağlık raporu ve tedavi planı hazırlanır."
  }
];
