'use client'

import { motion } from 'framer-motion'
import { team } from '@/data/siteData'
import { cn } from '@/lib/utils'

export default function Team() {
  return (
    <section id="team" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-medical-blue text-sm font-medium tracking-wider uppercase">
            Uzman Kadro
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mt-2">
            Ekibimiz
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Deneyimli veteriner hekimlerimiz, dostlarınızın sağlığı için burada
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
                
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-medical-blue font-medium">{member.title}</p>
                  <p className="text-gray-300 text-sm mt-1">{member.specialization}</p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-medical-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Decorative Element */}
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 rounded-full bg-medical-blue animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-4 glass px-8 py-4 rounded-full">
            <div className="flex -space-x-3">
              {team.map((member) => (
                <img
                  key={member.id}
                  src={member.image}
                  alt={member.name}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Uzman Ekip</p>
              <p className="text-xs text-gray-500">15+ yıllık deneyim</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
