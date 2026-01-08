'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { useAuthStore } from '@/lib/adminAuth'
import { cn } from '@/lib/utils'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'En az 10 karakter', test: (p) => p.length >= 10 },
  { label: 'En az bir büyük harf (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'En az bir küçük harf (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'En az bir rakam (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'En az bir özel karakter (!@#$%^&*)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export default function ForcePasswordChangePage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const allRequirementsMet = passwordRequirements.every(req => req.test(newPassword))
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0
  const canSubmit = currentPassword && allRequirementsMet && passwordsMatch && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError('')

    try {
      const res = await adminApi.changePassword(currentPassword, newPassword)
      
      if (res.error) {
        setError(res.error)
        return
      }

      setSuccess(true)
      
      // Update user state to clear must_change_password flag
      if (user) {
        setUser({ ...user, must_change_password: false })
      }

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (err) {
      setError('Şifre değiştirilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Şifre Değiştirildi</h1>
          <p className="text-gray-400">Yeni şifreniz başarıyla kaydedildi. Yönlendiriliyorsunuz...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Şifre Değişikliği Gerekli</h1>
          <p className="text-gray-400 text-sm">
            Güvenliğiniz için ilk girişte şifrenizi değiştirmeniz gerekmektedir.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Mevcut Şifre
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 pr-12"
                placeholder="••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Yeni Şifre
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 pr-12"
                placeholder="••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3 font-medium">Şifre Gereksinimleri:</p>
            <div className="grid gap-2">
              {passwordRequirements.map((req, i) => {
                const met = req.test(newPassword)
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center transition-colors',
                      met ? 'bg-green-500/20' : 'bg-gray-700'
                    )}>
                      {met && <CheckCircle className="w-3 h-3 text-green-400" />}
                    </div>
                    <span className={cn(
                      'text-xs transition-colors',
                      met ? 'text-green-400' : 'text-gray-500'
                    )}>
                      {req.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Yeni Şifre (Tekrar)
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none pr-12',
                  confirmPassword && !passwordsMatch
                    ? 'border-red-500 focus:border-red-500'
                    : passwordsMatch
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-gray-700 focus:border-teal-500'
                )}
                placeholder="••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-400 mt-1.5">Şifreler eşleşmiyor</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
              canSubmit
                ? 'bg-teal-500 text-white hover:bg-teal-600'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İşleniyor...
              </>
            ) : (
              'Şifreyi Değiştir'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
