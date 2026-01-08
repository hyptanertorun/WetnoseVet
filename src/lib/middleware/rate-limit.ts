import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting
// In production, use Redis or similar
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000 // 1 minute
}

const LOGIN_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 1000 // 5 attempts per minute
}

const PUBLIC_FORM_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000 // 5 submissions per hour
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    })
    return { allowed: true }
  }
  
  if (record.count >= config.maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000)
    return { allowed: false, retryAfterSeconds }
  }
  
  record.count++
  return { allowed: true }
}

export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      detail: {
        error: 'rate_limit_exceeded',
        message: `Çok fazla istek. ${Math.ceil(retryAfterSeconds / 60)} dakika sonra tekrar deneyin.`,
        retry_after_seconds: retryAfterSeconds
      }
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfterSeconds.toString()
      }
    }
  )
}

// Rate limit for login endpoint
export function checkLoginRateLimit(request: NextRequest, email?: string): { allowed: boolean; retryAfterSeconds?: number } {
  const ip = getClientIP(request)
  const key = email ? `login:${ip}:${email}` : `login:${ip}`
  return checkRateLimit(key, LOGIN_CONFIG)
}

// Rate limit for public form submissions
export function checkPublicFormRateLimit(request: NextRequest): { allowed: boolean; retryAfterSeconds?: number } {
  const ip = getClientIP(request)
  const key = `public_form:${ip}`
  return checkRateLimit(key, PUBLIC_FORM_CONFIG)
}

// Cleanup old entries periodically (call this occasionally)
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Set interval to cleanup (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
