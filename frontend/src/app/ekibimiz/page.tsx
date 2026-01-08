'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPublicTeamMembers, TeamMember } from '@/lib/publicApi'
import { Users, Stethoscope, Star, Crown, Sparkles, Shield, Heart, PawPrint, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import TestimonialsSection from '@/components/TestimonialsSection'

// Floating Hearts/Paws Component
function FloatingIcons({ isVisible, isOwner }: { isVisible: boolean; isOwner: boolean }) {
  const icons = [
    { id: 0, delay: 0, x: -30, duration: 1.6 },
    { id: 1, delay: 0.15, x: 20, duration: 1.8 },
    { id: 2, delay: 0.30, x: -15, duration: 1.5 },
    { id: 3, delay: 0.45, x: 35, duration: 1.7 },
    { id: 4, delay: 0.60, x: -25, duration: 1.9 },
    { id: 5, delay: 0.75, x: 10, duration: 1.6 },
  ]

  return (
    <AnimatePresence>
      {isVisible && icons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute pointer-events-none z-30"
          initial={{ 
            opacity: 0, 
            y: 0, 
            x: `calc(50% + ${icon.x}px)`,
            scale: 0.5 
          }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            y: -120, 
            scale: [0.5, 1, 0.8, 0.3],
            rotate: [0, icon.x > 0 ? 15 : -15, 0]
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: icon.duration, 
            delay: icon.delay,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.5
          }}
        >
          {isOwner ? (
            <Crown className="w-5 h-5 text-amber-400" />
          ) : (
            icon.id % 2 === 0 ? (
              <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
            ) : (
              <PawPrint className="w-4 h-4 text-teal-400" />
            )
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

export default function EkibimizPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)

  useEffect(() => {
    async function loadTeam() {
      const data = await getPublicTeamMembers()
      setTeamMembers(data)
      setLoading(false)
    }
    loadTeam()
  }, [])

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-6"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-300">Uzman Kadromuz</span>
            </motion.div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Ekibimiz
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Deneyimli ve sevgi dolu ekibimizle tanışın
            </p>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Henüz ekip üyesi eklenmemiş</p>
            </div>
          ) : (
            /* Team Grid - Compact Vertical Cards */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  onMouseEnter={() => setHoveredMember(member.id)}
                  onMouseLeave={() => setHoveredMember(null)}
                >
                  <Link href={`/ekibimiz/${member.slug}`}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      className={cn(
                        "group relative h-full rounded-xl p-0.5 transition-all duration-300",
                        member.is_owner 
                          ? "bg-gradient-to-br from-amber-500/40 via-yellow-500/30 to-orange-500/40"
                          : "bg-gradient-to-br from-teal-500/25 via-cyan-500/20 to-blue-500/25"
                      )}
                    >
                      {/* Floating Icons */}
                      <FloatingIcons isVisible={hoveredMember === member.id} isOwner={member.is_owner} />
                      
                      <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-xl overflow-hidden">
                        {/* Owner Badge */}
                        {member.is_owner && (
                          <div className="absolute top-2 right-2 z-20">
                            <motion.div 
                              className="flex items-center gap-1 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 backdrop-blur-sm border border-amber-400/50 rounded-full px-2 py-0.5"
                              animate={{ 
                                boxShadow: ['0 0 8px rgba(251, 191, 36, 0.3)', '0 0 16px rgba(251, 191, 36, 0.5)', '0 0 8px rgba(251, 191, 36, 0.3)']
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                              <span className="text-[10px] font-semibold text-amber-300">Kurucu</span>
                            </motion.div>
                          </div>
                        )}

                        {/* Vertical Image - 3:4 aspect ratio */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img
                            src={member.photo_url}
                            alt={member.full_name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className={cn(
                            "absolute inset-0 transition-opacity duration-300",
                            member.is_owner 
                              ? "bg-gradient-to-t from-gray-900 via-gray-900/40 to-amber-500/10"
                              : "bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"
                          )} />
                          
                          {/* Hover Overlay */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            member.is_owner ? "bg-amber-500/15" : "bg-teal-500/15"
                          )} />
                        </div>

                        {/* Content - overlapping bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-10">
                          {/* Icon Badge - Small */}
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110",
                            member.is_owner 
                              ? "bg-gradient-to-br from-amber-500/40 to-yellow-500/30 border border-amber-400/40"
                              : "bg-gradient-to-br from-teal-500/40 to-cyan-500/30 border border-teal-400/40"
                          )}>
                            <Stethoscope className={cn(
                              "w-4 h-4",
                              member.is_owner ? "text-amber-400" : "text-teal-400"
                            )} />
                          </div>

                          <h3 className={cn(
                            "text-sm font-bold mb-0.5 transition-colors duration-300 line-clamp-1",
                            member.is_owner 
                              ? "text-amber-100 group-hover:text-amber-300"
                              : "text-white group-hover:text-teal-300"
                          )}>
                            {member.full_name}
                          </h3>
                          <p className={cn(
                            "text-xs mb-2 line-clamp-1",
                            member.is_owner ? "text-amber-400/80" : "text-teal-400/80"
                          )}>
                            {member.role_title}
                          </p>

                          {/* Experience Badge - Compact */}
                          {member.experience && (
                            <div className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                              member.is_owner 
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-teal-500/20 text-teal-300"
                            )}>
                              <Star className="w-2.5 h-2.5" />
                              {member.experience}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      <Footer />
    </main>
  )
}
