'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Search, BookOpen, ArrowLeft, PawPrint } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030712]">
      <Header />
      
      <div className="pt-32 pb-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 404 Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-teal-500/10 border border-teal-500/30 mb-6">
              <PawPrint className="w-16 h-16 text-teal-400" />
            </div>
          </motion.div>

          {/* Error Code */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl sm:text-9xl font-bold text-white mb-4"
          >
            404
          </motion.h1>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl font-semibold text-white mb-4"
          >
            Sayfa Bulunamadı
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-lg mb-8 max-w-md mx-auto"
          >
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
            Endişelenmeyin, sizi doğru yere yönlendirelim!
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all"
            >
              <Home className="w-5 h-5" />
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/saglik-rehberi"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-semibold hover:bg-gray-700 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Sağlık Rehberi
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-8 border-t border-gray-800"
          >
            <p className="text-gray-500 text-sm mb-4">Popüler Sayfalar</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/hizmetler" className="px-4 py-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                Hizmetlerimiz
              </Link>
              <Link href="/ekibimiz" className="px-4 py-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                Ekibimiz
              </Link>
              <Link href="/randevu" className="px-4 py-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                Randevu Al
              </Link>
              <Link href="/hakkimizda" className="px-4 py-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                Hakkımızda
              </Link>
            </div>
          </motion.div>

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-gray-400 hover:text-teal-400 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Önceki sayfaya dön
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
