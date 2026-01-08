'use client'

import { motion } from 'framer-motion'
import { ShieldX, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Admin403Page() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6"
        >
          <ShieldX className="w-12 h-12 text-red-400" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Erişim Engellendi</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Bu sayfayı görüntülemek için yeterli yetkiniz bulunmamaktadır.
          Lütfen yöneticinizle iletişime geçin.
        </p>
        
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Dashboard'a Dön
        </Link>
      </motion.div>
    </div>
  )
}
