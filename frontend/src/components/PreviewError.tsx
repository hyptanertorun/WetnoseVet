'use client'

import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface PreviewErrorProps {
  error: string
  type?: 'expired' | 'notfound' | 'error'
}

export default function PreviewError({ error, type = 'error' }: PreviewErrorProps) {
  const isExpired = type === 'expired' || error.includes('süresi dolmuş') || error.includes('geçersiz')
  const isNotFound = type === 'notfound' || error.includes('bulunamadı')

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
          isExpired ? 'bg-amber-500/20' : isNotFound ? 'bg-gray-500/20' : 'bg-red-500/20'
        }`}>
          <AlertTriangle className={`w-10 h-10 ${
            isExpired ? 'text-amber-400' : isNotFound ? 'text-gray-400' : 'text-red-400'
          }`} />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">
          {isExpired ? 'Önizleme Süresi Doldu' : isNotFound ? 'İçerik Bulunamadı' : 'Önizleme Hatası'}
        </h1>
        
        <p className="text-gray-400 mb-8">
          {error}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Panele Dön
          </Link>
          
          {isExpired && (
            <button
              onClick={() => window.close()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
            >
              Pencereyi Kapat
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-600 mt-8">
          Admin panelden yeni bir önizleme linki oluşturabilirsiniz.
        </p>
      </motion.div>
    </div>
  )
}
