'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Service } from '@/lib/publicApi'
import { useSiteSettings, waDigits, telHref } from '@/hooks/useSiteSettings'
import { ArrowLeft, Clock, CheckCircle, Calendar, Phone, FlaskConical, Scan, Ambulance, Droplets, Stethoscope, HeartPulse, Scissors, Sparkles } from 'lucide-react'
import Link from 'next/link'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flask: FlaskConical,
  scan: Scan,
  ambulance: Ambulance,
  droplet: Droplets,
  stethoscope: Stethoscope,
  'heart-pulse': HeartPulse,
  scissors: Scissors,
  sparkles: Sparkles,
}

interface HizmetDetailClientProps {
  service: Service
}

export default function HizmetDetailClient({ service }: HizmetDetailClientProps) {
  const settings = useSiteSettings()
  const IconComponent = service.icon ? iconMap[service.icon.toLowerCase()] : Stethoscope

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24">
        <div className="container mx-auto px-4 py-16">
          {/* Back Button */}
          <Link 
            href="/hizmetler"
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Tüm Hizmetler
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  {IconComponent && (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-teal-400" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{service.title}</h1>
                    <p className="text-gray-400">{service.short_description}</p>
                  </div>
                </div>

                {/* Image */}
                {service.cover_image_url && (
                  <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
                    <img
                      src={service.cover_image_url}
                      alt={service.cover_image_alt || service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div 
                  className="prose prose-invert prose-teal max-w-none"
                  dangerouslySetInnerHTML={{ __html: service.long_description || service.short_description || '' }}
                />
              </motion.div>

              {/* Bu Hizmeti Veren Uzmanlar */}
              {service.providers && service.providers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mt-8"
                  data-testid="service-providers-section"
                >
                  <h2 className="text-xl font-semibold text-white mb-6">Bu Hizmeti Veren Uzmanlarımız</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {service.providers.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/ekibimiz/${p.slug}`}
                        className="group flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 hover:border-teal-500/50 transition-colors"
                      >
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={p.full_name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold">
                            {p.full_name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate group-hover:text-teal-400 transition-colors">{p.full_name}</p>
                          <p className="text-gray-500 text-xs truncate">{p.role_title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* İlgili Yazılar */}
              {service.related_blog_posts && service.related_blog_posts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mt-8"
                  data-testid="service-related-posts-section"
                >
                  <h2 className="text-xl font-semibold text-white mb-6">Sağlık Rehberinden İlgili Yazılar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {service.related_blog_posts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/saglik-rehberi/${post.slug}`}
                        className="group bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-teal-500/50 transition-colors"
                      >
                        {post.cover_image_url && (
                          <img src={post.cover_image_url} alt={post.title} className="w-full h-28 object-cover" />
                        )}
                        <div className="p-4">
                          <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-teal-400 transition-colors">{post.title}</p>
                          {post.excerpt && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{post.excerpt}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 sticky top-24"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Randevu Alın</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <span>Pazartesi - Cumartesi: 09:00 - 20:00</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-5 h-5 text-teal-400" />
                    <a href={telHref(settings?.phone)} className="hover:text-teal-400 transition-colors">
                      {settings?.phone || ''}
                    </a>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${waDigits(settings?.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  WhatsApp ile Randevu
                </a>

                {/* Features */}
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Neden Bizi Seçmelisiniz?</h4>
                  <ul className="space-y-3">
                    {['Uzman veteriner kadrosu', 'Modern ekipmanlar', '7/24 acil destek', 'Uygun fiyat politikası'].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
