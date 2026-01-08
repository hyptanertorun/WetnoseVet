'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Clock, WifiOff, ShieldAlert } from 'lucide-react'
import { useAuthStore, AdminUser } from '@/lib/adminAuth'
import { adminApi } from '@/lib/adminApi'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface LoginErrorDetails {
  error?: string
  message?: string
  retry_after_seconds?: number
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [errorType, setErrorType] = useState<'credentials' | 'rate_limit' | 'network' | 'server' | null>(null)
  const [retryAfter, setRetryAfter] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrorType(null)
    setRetryAfter(0)
    setIsLoading(true)

    try {
      const response = await adminApi.login(email, password, rememberMe)
      
      if (response.error) {
        // Parse error response
        const errorData = response.data as unknown as LoginErrorDetails
        
        // Check if it's a rate limit error (429)
        if (errorData?.retry_after_seconds) {
          setErrorType('rate_limit')
          setRetryAfter(errorData.retry_after_seconds)
          setError(`Çok fazla deneme yapıldı. ${Math.ceil(errorData.retry_after_seconds / 60)} dakika sonra tekrar deneyin.`)
        } else if (response.error.includes('E-posta') || response.error.includes('şifre')) {
          setErrorType('credentials')
          setError('E-posta veya şifre hatalı.')
        } else {
          setErrorType('server')
          setError(response.error)
        }
        setIsLoading(false)
        return
      }

      if (response.data) {
        const { access_token, refresh_token, user } = response.data
        setAuth(
          user as AdminUser,
          access_token,
          refresh_token
        )
        
        // Check if user must change password
        if (user.must_change_password) {
          router.push('/admin/force-password-change')
        } else {
          router.push('/admin')
        }
      }
    } catch (err) {
      // Network error or server unreachable
      setErrorType('network')
      setError('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.')
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorIcon = () => {
    switch (errorType) {
      case 'rate_limit':
        return <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
      case 'network':
        return <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
      case 'credentials':
        return <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
    }
  }

  const getErrorBgColor = () => {
    if (errorType === 'rate_limit') {
      return 'bg-amber-500/10 border-amber-500/30'
    }
    return 'bg-red-500/10 border-red-500/30'
  }

  const getErrorTextColor = () => {
    if (errorType === 'rate_limit') {
      return 'text-amber-400'
    }
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <Image
              src="/images/brand/logo.png"
              alt="WETNOSE Logo"
              width={200}
              height={120}
              className="w-48 h-auto object-contain"
              priority
            />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Yönetim Paneli</h1>
          <p className="text-gray-400 mt-1">Klinik İşletim Sistemi</p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-6 p-4 rounded-xl border flex items-start gap-3",
                getErrorBgColor()
              )}
            >
              {getErrorIcon()}
              <div>
                <p className={cn("text-sm", getErrorTextColor())}>{error}</p>
                {errorType === 'rate_limit' && retryAfter > 0 && (
                  <p className="text-xs text-amber-400/70 mt-1">
                    Kalan süre: {Math.ceil(retryAfter / 60)} dakika
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Email Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-posta
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="admin@wetnose.com.tr"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                  rememberMe 
                    ? "bg-teal-500 border-teal-500" 
                    : "border-gray-600 group-hover:border-gray-500"
                )}>
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                Beni hatırla
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1.5 ml-8">
              30 gün boyunca oturumunuz açık kalır
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || (errorType === 'rate_limit' && retryAfter > 0)}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className={cn(
              "w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
              isLoading || (errorType === 'rate_limit' && retryAfter > 0)
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/25"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Giriş yapılıyor...
              </>
            ) : errorType === 'rate_limit' && retryAfter > 0 ? (
              <>
                <Clock className="w-5 h-5" />
                Bekleyiniz...
              </>
            ) : (
              'Giriş Yap'
            )}
          </motion.button>
        </motion.form>

        {/* Back to Site */}
        <p className="text-center mt-6 text-gray-500 text-sm">
          <a href="/" className="text-teal-400 hover:text-teal-300 transition-colors">
            ← Ana siteye dön
          </a>
        </p>

        {/* Footer */}
        <p className="text-center mt-4 text-gray-600 text-xs">
          © {new Date().getFullYear()} Wetnose. Tüm hakları saklıdır.
        </p>
      </motion.div>
    </div>
  )
}
