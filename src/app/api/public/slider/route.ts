import { NextRequest, NextResponse } from 'next/server'
import { SliderService } from '@/lib/services/slider-service'

export async function GET() {
  try {
    const { slides } = await SliderService.listSlides(false) // Only active
    const settings = await SliderService.getSettings()
    
    return NextResponse.json({
      slides: slides.map(s => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        image_url: s.image_url,
        image_alt: s.image_alt,
        mobile_image_url: s.mobile_image_url,
        buttons: s.buttons.filter(b => b.is_visible).map(b => ({
          id: b.id,
          text: b.text,
          href: b.href,
          style: b.style,
          icon: b.icon,
          is_visible: b.is_visible
        })),
        overlay: {
          enabled: s.overlay.enabled,
          opacity: s.overlay.opacity,
          gradient_direction: s.overlay.gradient_direction,
          color: s.overlay.color
        },
        animation_duration: s.animation_duration
      })),
      settings: {
        id: settings.id,
        auto_play: settings.auto_play,
        auto_play_interval: settings.auto_play_interval,
        show_navigation_arrows: settings.show_navigation_arrows,
        show_navigation_dots: settings.show_navigation_dots,
        show_progress_bar: settings.show_progress_bar,
        show_slide_counter: settings.show_slide_counter,
        show_scroll_indicator: settings.show_scroll_indicator,
        badge: settings.badge,
        stats: settings.stats,
        ken_burns_effect: settings.ken_burns_effect,
        scan_line_effect: settings.scan_line_effect,
        updated_at: settings.updated_at?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Get public slider error:', error)
    return NextResponse.json(
      { detail: 'Slider alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
