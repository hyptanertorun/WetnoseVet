'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { clinicOwners } from '@/data/siteData'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { Building2, Heart, Award, Users, Shield, ChevronDown, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: 'Klinik çalışma saatleri nedir?',
    answer: 'Kliniğimiz Pazartesi-Cumartesi 09:00-18:00 saatleri arasında hizmet vermektedir. Acil durumlar için 7/24 ulaşılabilir durumdadır.'
  },
  {
    question: 'Randevu almadan gelebilir miyim?',
    answer: 'Evet, randevusuz da gelebilirsiniz ancak randevu almanız bekleme sürenizi minimuma indirecektir. Online veya telefonla randevu alabilirsiniz.'
  },
  {
    question: 'Hangi patili dostlar için hizmet veriyorsunuz?',
    answer: 'Kliniğimizde başta kedi ve köpekler olmak üzere, kuşlar, kemirgenler ve egzotik türler için de hizmet vermekteyiz.'
  },
  {
    question: 'Ödeme yöntemleri nelerdir?',
    answer: 'Nakit, kredi kartı ve banka kartı ile ödeme yapabilirsiniz. Ayrıca taksit imkanı da sunmaktayız.'
  },
  {
    question: 'Acil durumda ne yapmalıyım?',
    answer: 'Acil durumda bizi hemen telefonla arayın; güncel numaramız sitenin üst bölümünde ve İletişim sayfasında yer alır. Gece dahil 7/24 acil hizmet vermekteyiz.'
  },
  {
    question: 'Aşı takvimi nasıl olmalı?',
    answer: 'Yavru patili dostlarınız için 6-8 haftadan itibaren aşı programı başlar. Detaylı aşı takvimi için kliniğimize danışabilirsiniz.'
  }
]

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <motion.div
      initial={false}
      className="border-b border-white/10"
    >
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-teal-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-gray-400 pb-5 pr-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HakkimizdaPage() {
  const settings = useSiteSettings()
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  const stats = [
    { icon: Users, value: '10,000+', label: 'Mutlu Dost' },
    { icon: Award, value: '15+', label: 'Yıllık Deneyim' },
    { icon: Heart, value: '6', label: 'Uzman Hekim' },
    { icon: Shield, value: '7/24', label: 'Acil Hizmet' }
  ]

  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />
      
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[180px]"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]"
            animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-6"
            >
              <Building2 className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-300">WETNOSE Veteriner</span>
            </motion.div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Hakkımızda
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Kocaeli&apos;nin güvenilir veteriner kliniği
            </p>
          </motion.div>

          {/* About Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 mb-12"
          >
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                <strong className="text-white">WETNOSE Veteriner Kliniği</strong>, 2010 yılından bu yana Kocaeli İzmit'te dostlarınıza en kaliteli veteriner hizmetini sunmaktadır.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Kliniğimiz, modern tıbbi cihazlar ve deneyimli veteriner hekim kadrosuyla, patili dostlarınızın sağlığını korumak ve iyileştirmek için çalışmaktadır. Genel muayeneden cerrahiye, laboratuvar hizmetlerinden acil müdahaleye kadar geniş bir yelpazede hizmet sunuyoruz.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Misyonumuz, her patili dostun hak ettiği şefkatli ve profesyonel bakımı almasını sağlamaktır. Yıllar içinde kazandığımız deneyim ve güvenle, binlerce patili dostun sağlığına kavuşmasına yardımcı olduk.
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-teal-500/10 backdrop-blur-xl border border-teal-400/20 rounded-2xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Founders */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Kurucularımız</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clinicOwners.map((owner) => {
                const ownerSlug = owner.name
                  .replace(/İ/g, 'i')
                  .replace(/I/g, 'i')
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[üÜ]/g, 'u')
                  .replace(/[öÖ]/g, 'o')
                  .replace(/[çÇ]/g, 'c')
                  .replace(/[şŞ]/g, 's')
                  .replace(/[ğĞ]/g, 'g')
                  .replace(/[ıİ]/g, 'i')
                return (
                <Link key={owner.id} href={`/ekibimiz/${ownerSlug}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="group bg-gradient-to-b from-yellow-500/10 to-teal-500/5 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 flex items-center gap-5 cursor-pointer hover:border-yellow-400/50 transition-all"
                  >
                    <img
                      src={owner.image}
                      alt={owner.name}
                      className="w-20 h-20 rounded-xl object-cover object-top"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">{owner.name}</h3>
                      <p className="text-yellow-400 text-sm">{owner.role}</p>
                      <p className="text-gray-500 text-sm">{owner.specialization}</p>
                    </div>
                  </motion.div>
                </Link>
              )})}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">İletişim Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Adres</h3>
                  <p className="text-gray-400 text-sm">{settings?.address || ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Telefon</h3>
                  <p className="text-gray-400 text-sm">{settings?.phone || ''}</p>
                  {settings?.emergency_phone && <p className="text-gray-400 text-sm">{settings.emergency_phone}</p>}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">E-posta</h3>
                  <p className="text-gray-400 text-sm">{settings?.email || ''}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Sık Sorulan Sorular</h2>
            <div>
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
