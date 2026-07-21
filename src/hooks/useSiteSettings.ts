'use client'

import { useEffect, useState } from 'react'

export interface PublicSettings {
  clinic_name: string
  phone: string
  whatsapp: string
  emergency_phone?: string | null
  email: string
  address: string
  city: string
  district: string
  is_24_7_emergency: boolean
  social_links: Record<string, string | null>
  working_hours?: { day: string; open_time: string; close_time: string; is_closed: boolean }[]
  maps_embed_url?: string | null
}

let cache: PublicSettings | null = null
let inflight: Promise<PublicSettings | null> | null = null

async function fetchSettings(): Promise<PublicSettings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/public/settings`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export function useSiteSettings(): PublicSettings | null {
  const [settings, setSettings] = useState<PublicSettings | null>(cache)
  useEffect(() => {
    if (cache) return
    if (!inflight) inflight = fetchSettings().then(s => { cache = s; return s })
    inflight.then(s => { if (s) setSettings(s) })
  }, [])
  return settings
}

// Normalize any TR phone input to wa.me digits (90XXXXXXXXXX)
export function waDigits(v?: string | null): string {
  if (!v) return ''
  let d = v.replace(/\D/g, '')
  if (d.startsWith('0')) d = '9' + d
  else if (d.length === 10) d = '90' + d
  return d
}

export function telHref(v?: string | null): string {
  return `tel:${(v || '').replace(/\s/g, '')}`
}
