'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Star, Crown, Sparkles, Shield, Heart, PawPrint, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TeamMember {
  id: string
  full_name: string
  slug: string
  role_title: string
  specialties: string[]
  bio?: string
  short_bio?: string
  photo_url: string
  experience?: string
  experience_years?: number
  quote?: string
  is_owner: boolean
  is_featured: boolean
}

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
          style={{ bottom: '60%' }}
        >
          {icon.id % 2 === 0 ? (
            <Heart className={cn(
              "w-4 h-4 fill-current",
              isOwner ? "text-pink-400" : "text-teal-400"
            )} />
          ) : (
            <PawPrint className={cn(
              "w-4 h-4",
              isOwner ? "text-yellow-400" : "text-teal-300"
            )} />
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

export default function Team() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
        const response = await fetch(`${apiUrl}/api/public/team-members`)
        if (response.ok) {
          const data = await response.json()
          // Sort: owners first (by sort_order), then others
          const sorted = (data.team_members || []).sort((a: TeamMember, b: TeamMember) => {
            if (a.is_owner && !b.is_owner) return -1
            if (!a.is_owner && b.is_owner) return 1
            return 0
          })
          setTeamMembers(sorted)
        }
      } catch (error) {
        console.error('Failed to fetch team:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTeam()
  }, [])

  // Calculate total experience
  const totalExperience = teamMembers.reduce((sum, m) => sum + (m.experience_years || 0), 0)
  const owners = teamMembers.filter(m => m.is_owner)

  if (loading) {
    return (
      <section id="team" className="py-24 bg-[#030712] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    )
  }

  if (teamMembers.length === 0) {
    return null
  }

  return (
    <section id="team" className="py-24 bg-[#030712] relative overflow-hidden">
      {/* Background Effects - Parallax */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[180px]"
          animate={{ 
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[150px]"
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[200px]"
          animate={{ 
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(5px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/35 rounded-full px-5 py-2.5 mb-6 shadow-lg shadow-teal-500/20"
          >
            <Users className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">Uzman Kadro</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mt-2">
            Ekibimiz
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
            Deneyimli veteriner hekimlerimiz, dostlarınızın sağlığı için burada
          </p>
        </motion.div>

        {/* Team Grid - Dynamic columns based on count */}
        <div className={cn(
          "grid gap-5 lg:gap-6 items-stretch max-w-7xl mx-auto",
          teamMembers.length <= 3 ? "grid-cols-1 md:grid-cols-3 max-w-4xl" :
          teamMembers.length <= 4 ? "grid-cols-2 md:grid-cols-4 max-w-5xl" :
          teamMembers.length <= 6 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" :
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}>
          {teamMembers.map((member, index) => {
            const isOwner = member.is_owner
            const uniqueId = member.id
            const isHovered = hoveredId === uniqueId
            
            return (
              <motion.div
                key={uniqueId}
                initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.12, 
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                onMouseEnter={() => setHoveredId(uniqueId)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={`/ekibimiz/${member.slug}`}>
                  <motion.div
                    animate={{ 
                      y: isHovered ? (isOwner ? -15 : -10) : 0,
                      scale: isHovered ? 1.03 : 1,
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className={cn(
                      "relative rounded-2xl overflow-hidden backdrop-blur-xl border h-full cursor-pointer",
                      isOwner 
                        ? "bg-gradient-to-b from-yellow-500/15 via-teal-500/10 to-teal-500/5 border-yellow-500/40" 
                        : "bg-teal-500/10 border-teal-400/20",
                      isHovered && (isOwner ? "border-yellow-400/70" : "border-teal-400/50")
                    )}
                    style={{
                      boxShadow: isHovered 
                        ? isOwner
                          ? '0 25px 60px -10px rgba(234, 179, 8, 0.35), 0 0 30px rgba(20, 184, 166, 0.15)' 
                          : '0 20px 40px -10px rgba(20, 184, 166, 0.3)'
                        : isOwner
                          ? '0 10px 40px -10px rgba(234, 179, 8, 0.2)'
                          : '0 4px 20px -5px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Owner Crown Badge */}
                    {isOwner && (
                      <div className="absolute top-3 left-3 z-20">
                        <motion.div 
                          className="bg-gradient-to-r from-yellow-500/50 to-yellow-600/50 backdrop-blur-xl border border-yellow-400/50 rounded-full p-1.5"
                          animate={{ scale: isHovered ? 1.1 : 1 }}
                        >
                          <Crown className="w-3.5 h-3.5 text-yellow-200" />
                        </motion.div>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {member.is_featured && !isOwner && (
                      <div className="absolute top-3 left-3 z-20">
                        <motion.div 
                          className="bg-gradient-to-r from-purple-500/50 to-purple-600/50 backdrop-blur-xl border border-purple-400/50 rounded-full p-1.5"
                          animate={{ scale: isHovered ? 1.1 : 1 }}
                        >
                          <Star className="w-3.5 h-3.5 text-purple-200 fill-current" />
                        </motion.div>
                      </div>
                    )}

                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-[3/4]">
                      <motion.img
                        src={member.photo_url}
                        alt={member.full_name}
                        className="w-full h-full object-cover object-top"
                        animate={{ scale: isHovered ? 1.08 : 1 }}
                        transition={{ duration: 0.6 }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-[#030712] from-5%",
                        isOwner ? "via-[#030712]/70 via-30%" : "via-[#030712]/60 via-25%",
                        "to-transparent to-70%"
                      )} />
                      
                      {/* Corner Frames */}
                      <motion.div 
                        className={cn(
                          "absolute top-4 left-4 border-l-2 border-t-2 rounded-tl-xl",
                          isOwner ? "w-14 h-14" : "w-10 h-10"
                        )}
                        animate={{ 
                          borderColor: isHovered 
                            ? isOwner ? 'rgba(250, 204, 21, 0.9)' : 'rgba(20, 184, 166, 0.9)'
                            : isOwner ? 'rgba(250, 204, 21, 0.3)' : 'rgba(20, 184, 166, 0.2)'
                        }}
                      />
                      <motion.div 
                        className={cn(
                          "absolute top-4 right-4 border-r-2 border-t-2 rounded-tr-xl",
                          isOwner ? "w-14 h-14" : "w-10 h-10"
                        )}
                        animate={{ 
                          borderColor: isHovered 
                            ? isOwner ? 'rgba(250, 204, 21, 0.9)' : 'rgba(20, 184, 166, 0.9)'
                            : isOwner ? 'rgba(250, 204, 21, 0.3)' : 'rgba(20, 184, 166, 0.2)'
                        }}
                      />

                      {/* Status Dot for non-owners */}
                      {!isOwner && !member.is_featured && (
                        <div className="absolute top-5 left-5">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
                          />
                        </div>
                      )}

                      {/* Scan Line Effect */}
                      {isHovered && (
                        <motion.div
                          className={cn(
                            "absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent to-transparent",
                            isOwner ? "via-yellow-400" : "via-teal-400"
                          )}
                          initial={{ top: '10%' }}
                          animate={{ top: '90%' }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        />
                      )}

                      {/* Sparkles for Owners */}
                      {isOwner && isHovered && (
                        <motion.div
                          className="absolute top-16 right-6"
                          animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                        </motion.div>
                      )}
                    </div>

                    {/* Floating Hearts & Paws on Hover */}
                    <FloatingIcons isVisible={isHovered} isOwner={isOwner} />

                    {/* Info Section */}
                    <div className={cn(
                      "relative z-10",
                      isOwner ? "p-6 -mt-4" : "p-5 -mt-3"
                    )}>
                      <motion.h3 
                        className={cn(
                          "font-bold mb-2 transition-colors duration-300 leading-tight",
                          isOwner ? "text-lg" : "text-base"
                        )}
                        animate={{ 
                          color: isHovered 
                            ? isOwner ? '#fcd34d' : '#5eead4'
                            : '#ffffff'
                        }}
                      >
                        {member.full_name}
                      </motion.h3>
                      
                      <p className={cn(
                        "text-gray-500 mb-3",
                        isOwner ? "text-sm" : "text-xs"
                      )}>
                        {member.role_title}
                      </p>

                      {/* Specialties */}
                      {member.specialties && member.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {member.specialties.slice(0, 2).map((specialty, i) => (
                            <span 
                              key={i}
                              className={cn(
                                "px-2 py-0.5 rounded text-xs",
                                isOwner 
                                  ? "bg-yellow-500/20 text-yellow-300/80" 
                                  : "bg-teal-500/20 text-teal-300/80"
                              )}
                            >
                              {specialty}
                            </span>
                          ))}
                          {member.specialties.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded text-xs">
                              +{member.specialties.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Experience Badge */}
                      {member.experience && (
                        <div className="mb-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                            isOwner 
                              ? "bg-yellow-500/20 border border-yellow-400/30 text-yellow-300" 
                              : "bg-teal-500/20 border border-teal-400/30 text-teal-300"
                          )}>
                            <Clock className="w-3 h-3" />
                            {member.experience}
                          </span>
                        </div>
                      )}

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className={cn(
                              "fill-current",
                              isOwner ? "w-4 h-4 text-yellow-400" : "w-3.5 h-3.5 text-teal-400"
                            )} />
                          ))}
                        </div>
                        <span className={cn(
                          "font-bold",
                          isOwner ? "text-yellow-400 text-base" : "text-teal-400 text-sm"
                        )}>5.0</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className={cn(
                        "rounded-full overflow-hidden border",
                        isOwner 
                          ? "h-2.5 bg-yellow-500/10 border-yellow-500/20" 
                          : "h-2 bg-teal-500/10 border-teal-400/20"
                      )}>
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            isOwner 
                              ? "bg-gradient-to-r from-yellow-500/60 to-teal-500/60" 
                              : "bg-teal-500/40"
                          )}
                          initial={{ width: 0 }}
                          whileInView={{ width: isOwner ? '98%' : '85%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t to-transparent pointer-events-none",
                          isOwner ? "from-yellow-500/15" : "from-teal-500/15"
                        )}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-5 bg-gradient-to-r from-teal-500/10 via-yellow-500/5 to-teal-500/10 backdrop-blur-xl border border-teal-400/25 px-8 py-4 rounded-2xl">
            <div className="flex -space-x-3">
              {teamMembers.slice(0, 4).map((member) => (
                <motion.img
                  key={member.id}
                  src={member.photo_url}
                  alt={member.full_name}
                  className={cn(
                    "w-12 h-12 rounded-full object-cover object-top ring-2 ring-[#030712] border-2",
                    member.is_owner ? "border-yellow-500/50" : "border-teal-500/50"
                  )}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                />
              ))}
              {teamMembers.length > 4 && (
                <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 bg-teal-500/20 flex items-center justify-center text-sm text-teal-400 font-bold backdrop-blur-sm ring-2 ring-[#030712]">
                  +{teamMembers.length - 4}
                </div>
              )}
            </div>
            <div className="h-10 w-[1px] bg-gradient-to-b from-yellow-500/30 via-teal-500/30 to-yellow-500/30" />
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-yellow-400" />
                <p className="text-lg font-bold text-white">{teamMembers.length} Uzman Hekim</p>
              </div>
              <p className="text-sm text-gray-400">
                {totalExperience > 0 ? `${totalExperience}+ yıl toplam deneyim` : 'Profesyonel veteriner ekibi'}
              </p>
            </div>
          </div>

          {/* View All Button */}
          <div className="mt-8">
            <Link 
              href="/ekibimiz"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 hover:border-teal-400/50 rounded-xl text-teal-300 font-medium transition-all"
            >
              Tüm Ekibi Gör
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
