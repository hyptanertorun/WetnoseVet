import React, { useState, useEffect, useRef } from 'react';
import { heroSlides } from '../data/mockData';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_furry-makeover-2/artifacts/45ik1y82_logo_anasayfa.png";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const scrollToNext = () => {
    document.getElementById('hizmetler')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" ref={heroRef} className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: `scale(1.05) translate(${mousePosition.x * -8}px, ${mousePosition.y * -8}px)`
              }}
            />
          </div>
        ))}
      </div>

      {/* Elegant Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-xl">
            {/* Subtle accent line */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-teal-400/60" />
              <span className="text-teal-300/90 text-xs tracking-[0.25em] uppercase font-light">Veteriner Kliniği</span>
            </div>

            {/* Main Title - Elegant Typography */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6 tracking-tight">
              Dostlarınıza
              <br />
              <span className="font-semibold text-teal-300">Özel Bakım</span>
            </h1>

            {/* Subtitle - Light & Refined */}
            <p className="text-lg text-white/70 font-light mb-10 leading-relaxed max-w-md">
              Modern kliniğimizde minik dostlarınız için profesyonel
              sağlık hizmetleri sunuyoruz.
            </p>

            {/* CTA Buttons - Minimal & Elegant */}
            <div className="flex flex-wrap gap-4">
              <button className="px-7 py-3 bg-teal-500 text-white text-sm font-medium tracking-wide rounded-full hover:bg-teal-600 transition-all duration-300">
                Randevu Al
              </button>
              <button className="px-7 py-3 bg-white/10 backdrop-blur-sm text-white text-sm font-medium tracking-wide rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                Hizmetlerimiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation - Minimal */}
      <div className="absolute bottom-24 right-6 lg:right-12 z-20 flex flex-col gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide 
                ? 'w-2 h-8 bg-teal-400' 
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <div className="absolute bottom-24 left-6 lg:left-12 z-20 flex gap-3">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Scroll Indicator - Refined */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-light">Keşfet</span>
        <ChevronDown size={20} strokeWidth={1} className="animate-bounce" />
      </button>
    </section>
  );
};

export default HeroSection;
