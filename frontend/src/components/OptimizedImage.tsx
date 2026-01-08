'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  className?: string
  containerClassName?: string
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

// Default blur placeholder for images
const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIRAAAgIBAwUBAAAAAAAAAAAAAQIDBAAFERIGEyExQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBf/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8AzWl9O6dqGnwTy3bkUkiB2jCLsrEbgH58ZmtT6L0+pSsSwWLTNFI0ZZwu5KsRuOleP5jGVFLEqDKoOYMTuf/Z'

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  containerClassName,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality = 80,
  placeholder = 'blur',
  blurDataURL = defaultBlurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // For external URLs that can't use next/image optimization
  const isExternalUrl = src.startsWith('http') && !src.includes('unsplash') && !src.includes(process.env.NEXT_PUBLIC_API_URL || '')

  if (error || !src) {
    return (
      <div className={cn(
        'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center',
        containerClassName
      )}>
        <span className="text-teal-400/50 text-sm">Görsel yüklenemedi</span>
      </div>
    )
  }

  // For external images not in our allowed domains, use regular img
  if (isExternalUrl) {
    return (
      <div className={cn('relative overflow-hidden', containerClassName)}>
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => setError(true)}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-all duration-300',
          isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  )
}
