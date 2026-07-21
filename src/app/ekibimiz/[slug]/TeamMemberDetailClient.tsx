'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { TeamMember } from '@/lib/publicApi'
import { 
  ArrowLeft, 
  Stethoscope, 
  Calendar, 
  Crown, 
  Star, 
  Award, 
  Heart,
  MessageCircle,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Users,
  Sparkles,
  Quote
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSiteSettings, waDigits } from '@/hooks/useSiteSettings'

interface TeamMemberDetailClientProps {
  member: TeamMember
  otherMembers: TeamMember[]
}

export default function TeamMemberDetailClient({ member, otherMembers }: TeamMemberDetailClientProps) {
  const settings = useSiteSettings()
  const WHATSAPP_LINK = `https://wa.me/${waDigits(settings?.whatsapp)}`
  const isOwner = member.is_owner
  const accentColor = isOwner ? 'amber' : 'teal'

  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />
      
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div 
            className={cn(
              "absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full blur-[180px]",
              isOwner ? "bg-amber-500/10" : "bg-teal-500/10"
            )}
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
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="/ekibimiz"
              className={cn(
                "inline-flex items-center mb-8 group transition-colors",
                isOwner ? "text-amber-400 hover:text-amber-300" : "text-teal-400 hover:text-teal-300"
              )}
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Ekip Sayfasına Dön
            </Link>
          </motion.div>

          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Left: Photo */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className={cn(
                "relative rounded-2xl overflow-hidden p-1",
                isOwner 
                  ? "bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-orange-500/30"
                  : "bg-gradient-to-br from-teal-500/20 via-cyan-500/15 to-blue-500/20"
              )}>
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={member.photo_url}
                    alt={member.photo_alt || member.full_name}
                    className="w-full h-[400px] sm:h-[500px] object-cover object-top"
                  />
                  <div className={cn(
                    "absolute inset-0",
                    isOwner 
                      ? "bg-gradient-to-t from-gray-900 via-transparent to-amber-500/10"
                      : "bg-gradient-to-t from-gray-900 via-transparent to-transparent"
                  )} />
                </div>
              </div>
              
              {/* Owner Badge */}
              {isOwner && (
                <motion.div 
                  className="absolute top-6 right-6 flex items-center gap-1.5 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 backdrop-blur-sm border border-amber-400/50 rounded-full px-4 py-2"
                  animate={{ 
                    boxShadow: ['0 0 10px rgba(251, 191, 36, 0.3)', '0 0 20px rgba(251, 191, 36, 0.5)', '0 0 10px rgba(251, 191, 36, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">Kurucu</span>
                </motion.div>
              )}
              
              {/* Experience Badge */}
              {member.experience && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={cn(
                    "absolute -bottom-4 -right-4 backdrop-blur-xl border rounded-xl p-4",
                    isOwner 
                      ? "bg-amber-500/10 border-amber-400/20"
                      : "bg-teal-500/10 border-teal-400/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isOwner ? "bg-amber-500/30" : "bg-teal-500/30"
                    )}>
                      <Star className={cn("w-6 h-6", isOwner ? "text-amber-400" : "text-teal-400")} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Deneyim</p>
                      <p className="text-white font-semibold">{member.experience}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right: Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Icon Badge */}
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                isOwner 
                  ? "bg-amber-500/20 border border-amber-400/30"
                  : "bg-teal-500/20 border border-teal-400/30"
              )}>
                <Stethoscope className={cn("w-8 h-8", isOwner ? "text-amber-400" : "text-teal-400")} />
              </div>
              
              <h1 className={cn(
                "text-4xl lg:text-5xl font-bold mb-2",
                isOwner ? "text-amber-100" : "text-white"
              )}>
                {member.full_name}
              </h1>
              
              <p className={cn(
                "text-xl mb-6",
                isOwner ? "text-amber-400/80" : "text-teal-400/80"
              )}>
                {member.role_title}
              </p>

              {/* Quote */}
              {member.quote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "relative mb-8 p-4 rounded-xl border-l-4",
                    isOwner 
                      ? "bg-amber-500/10 border-amber-400"
                      : "bg-teal-500/10 border-teal-400"
                  )}
                >
                  <Quote className={cn(
                    "absolute -top-2 -left-2 w-8 h-8 opacity-30",
                    isOwner ? "text-amber-400" : "text-teal-400"
                  )} />
                  <p className="text-gray-300 italic text-lg pl-4">
                    "{member.quote}"
                  </p>
                </motion.div>
              )}

              {/* Specialties Chips */}
              {member.specialties && member.specialties.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Award className={cn("w-4 h-4", isOwner ? "text-amber-400" : "text-teal-400")} />
                    Uzmanlık Alanları
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, idx) => (
                      <span 
                        key={idx}
                        className={cn(
                          "px-4 py-2 rounded-full border text-sm font-medium",
                          isOwner 
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                            : "bg-teal-500/10 border-teal-500/30 text-teal-300"
                        )}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {member.social_links && Object.values(member.social_links).some(v => v) && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Sosyal Medya
                  </h3>
                  <div className="flex gap-3">
                    {member.social_links.instagram && (
                      <a 
                        href={member.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          isOwner 
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            : "bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20"
                        )}
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {member.social_links.linkedin && (
                      <a 
                        href={member.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          isOwner 
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            : "bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20"
                        )}
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {member.social_links.twitter && (
                      <a 
                        href={member.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          isOwner 
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            : "bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20"
                        )}
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {member.social_links.facebook && (
                      <a 
                        href={member.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          isOwner 
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            : "bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20"
                        )}
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/randevu"
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all",
                    isOwner 
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:shadow-amber-500/25"
                      : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-teal-500/25"
                  )}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Randevu Talebi Bırak
                </Link>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-3 border rounded-xl font-semibold transition-all",
                    isOwner 
                      ? "bg-amber-500/10 border-amber-400/30 text-amber-400 hover:bg-amber-500/20"
                      : "bg-teal-500/10 border-teal-400/30 text-teal-400 hover:bg-teal-500/20"
                  )}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </div>

          {/* Bio Section */}
          {member.bio && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={cn(
                "backdrop-blur-xl border rounded-2xl p-8 mb-12",
                isOwner 
                  ? "bg-amber-500/10 border-amber-400/20"
                  : "bg-teal-500/10 border-teal-400/20"
              )}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Heart className={cn("w-6 h-6", isOwner ? "text-amber-400" : "text-teal-400")} />
                Hakkında
              </h2>
              <div 
                className="prose prose-invert prose-teal max-w-none text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: member.bio }}
              />
            </motion.div>
          )}

          {/* Other Team Members */}
          {otherMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-teal-400" />
                  Diğer Ekip Üyeleri
                </h2>
                <Link 
                  href="/ekibimiz"
                  className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
                >
                  Tümünü Gör
                </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherMembers.map((other, index) => (
                  <motion.div
                    key={other.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link href={`/ekibimiz/${other.slug}`}>
                      <div className={cn(
                        "group relative rounded-xl p-0.5 transition-all duration-300 hover:scale-[1.02]",
                        other.is_owner 
                          ? "bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-orange-500/30"
                          : "bg-gradient-to-br from-teal-500/20 via-cyan-500/15 to-blue-500/20"
                      )}>
                        <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-xl overflow-hidden">
                          {/* Owner Badge */}
                          {other.is_owner && (
                            <div className="absolute top-2 right-2 z-20">
                              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 backdrop-blur-sm border border-amber-400/50 rounded-full px-2 py-0.5">
                                <Crown className="w-2.5 h-2.5 text-amber-400" />
                                <span className="text-[10px] font-semibold text-amber-300">Kurucu</span>
                              </div>
                            </div>
                          )}

                          {/* Vertical Image - 3:4 aspect ratio */}
                          <div className="relative aspect-[3/4] overflow-hidden">
                            <img
                              src={other.photo_url}
                              alt={other.full_name}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className={cn(
                              "absolute inset-0",
                              other.is_owner 
                                ? "bg-gradient-to-t from-gray-900 via-gray-900/40 to-amber-500/10"
                                : "bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"
                            )} />
                          </div>

                          {/* Content - overlapping bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-8">
                            <h3 className={cn(
                              "text-sm font-bold mb-0.5 transition-colors duration-300 line-clamp-1",
                              other.is_owner 
                                ? "text-amber-100 group-hover:text-amber-300"
                                : "text-white group-hover:text-teal-300"
                            )}>
                              {other.full_name}
                            </h3>
                            <p className={cn(
                              "text-xs line-clamp-1",
                              other.is_owner ? "text-amber-400/80" : "text-teal-400/80"
                            )}>
                              {other.role_title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/30 rounded-2xl p-8 mt-12"
          >
            <Sparkles className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Sorularınız mı var?
            </h3>
            <p className="text-gray-400 mb-6">
              Uzman ekibimiz size yardımcı olmaktan mutluluk duyar.
            </p>
            <Link
              href="/randevu"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Hemen Randevu Al
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
