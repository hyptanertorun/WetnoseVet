'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Power, Clock, MessageSquare, Save, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminApi } from '@/lib/adminApi'
import Link from 'next/link'

interface MaintenanceSettings {
  maintenance_mode: boolean
  maintenance_message: string | null
  maintenance_end_date: string | null
}

export default function MaintenancePage() {
  const [settings, setSettings] = useState<MaintenanceSettings>({
    maintenance_mode: false,
    maintenance_message: 'Sitemiz şu anda güncelleniyor. Çok yakında daha iyi bir deneyimle karşınızda olacağız!',
    maintenance_end_date: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await adminApi.getSettings()
      setSettings({
        maintenance_mode: data.maintenance_mode || false,
        maintenance_message: data.maintenance_message || 'Sitemiz şu anda güncelleniyor. Çok yakında daha iyi bir deneyimle karşınızda olacağız!',
        maintenance_end_date: data.maintenance_end_date ? data.maintenance_end_date.slice(0, 16) : null,
      })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setMessage({ type: 'error', text: 'Ayarlar yüklenemedi' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await adminApi.updateSettings({
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message,
        maintenance_end_date: settings.maintenance_end_date ? new Date(settings.maintenance_end_date).toISOString() : null,
      })
      setMessage({ type: 'success', text: 'Bakım modu ayarları güncellendi' })
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage({ type: 'error', text: 'Ayarlar kaydedilemedi' })
    } finally {
      setSaving(false)
    }
  }

  const toggleMaintenanceMode = async () => {
    const newMode = !settings.maintenance_mode
    setSettings(prev => ({ ...prev, maintenance_mode: newMode }))
    
    setSaving(true)
    try {
      await adminApi.updateSettings({
        maintenance_mode: newMode,
        maintenance_message: settings.maintenance_message,
        maintenance_end_date: settings.maintenance_end_date ? new Date(settings.maintenance_end_date).toISOString() : null,
      })
      setMessage({ 
        type: 'success', 
        text: newMode ? 'Site bakım moduna alındı' : 'Site yayına açıldı' 
      })
    } catch (error) {
      setSettings(prev => ({ ...prev, maintenance_mode: !newMode }))
      setMessage({ type: 'error', text: 'Ayar değiştirilemedi' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Wrench className="w-8 h-8 text-teal-400" />
          Bakım Modu Yönetimi
        </h1>
        <p className="text-gray-400 mt-2">
          Site bakım modunu yönetin. Aktifken ziyaretçiler bakım sayfasını görür.
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {message.text}
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Control Card */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Power className="w-5 h-5 text-teal-400" />
              Ana Kontrol
            </CardTitle>
            <CardDescription>
              Bakım modunu tek tıkla aç/kapat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div>
                <p className="text-white font-medium mb-1">Bakım Modu</p>
                <p className="text-sm text-gray-400">
                  {settings.maintenance_mode 
                    ? 'Site şu anda bakımda - Ziyaretçiler bakım sayfasını görüyor'
                    : 'Site aktif - Ziyaretçiler normal sayfaları görüyor'
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  settings.maintenance_mode 
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {settings.maintenance_mode ? 'BAKIMDA' : 'AKTİF'}
                </span>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={toggleMaintenanceMode}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Warning when maintenance mode is active */}
            {settings.maintenance_mode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-orange-400 font-medium">Bakım Modu Aktif</p>
                    <p className="text-sm text-orange-400/70 mt-1">
                      Ziyaretçiler şu anda siteye erişemiyor. Admin paneline giriş yapmış kullanıcılar siteyi normal görebilir.
                    </p>
                    <p className="text-sm text-orange-400/70 mt-2">
                      <strong>Önizleme için:</strong> URL sonuna <code className="bg-orange-500/20 px-1 rounded">?preview=admin</code> ekleyin
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-teal-400" />
              Önizleme
            </CardTitle>
            <CardDescription>
              Bakım modundayken siteyi test edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative group">
              <iframe
                src="/bakim"
                className="w-full h-full"
                title="Bakım Sayfası Önizleme"
              />
            </div>
            
            {/* Quick Preview Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/?preview=admin" target="_blank">
                <Button variant="outline" className="w-full bg-teal-500/10 border-teal-500/30 text-teal-400 hover:bg-teal-500/20">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Anasayfayı Önizle
                </Button>
              </Link>
              <Link href="/bakim" target="_blank">
                <Button variant="outline" className="w-full bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Bakım Sayfası
                </Button>
              </Link>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              💡 Admin panele giriş yaptığınızda siteyi otomatik önizleyebilirsiniz
            </p>
          </CardContent>
        </Card>

        {/* Message Settings */}
        <Card className="bg-gray-900/50 border-gray-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-400" />
              Bakım Mesajı Ayarları
            </CardTitle>
            <CardDescription>
              Ziyaretçilere gösterilecek mesajı özelleştirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white">Bakım Mesajı</Label>
                <Textarea
                  value={settings.maintenance_message || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintenance_message: e.target.value }))}
                  placeholder="Ziyaretçilere gösterilecek mesaj..."
                  className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  Ziyaretçilere neden sitenin kapalı olduğunu açıklayın
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tahmini Açılış Zamanı (Opsiyonel)
                </Label>
                <Input
                  type="datetime-local"
                  value={settings.maintenance_end_date || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintenance_end_date: e.target.value || null }))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500">
                  Belirlenen zaman bakım sayfasında geri sayım olarak gösterilir
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
