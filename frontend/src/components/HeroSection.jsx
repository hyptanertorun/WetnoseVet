import React, { useState, useEffect, useRef } from 'react';
import { heroSlides } from '../data/mockData';
import { ChevronDown, Sparkles, Play } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_furry-makeover-2/artifacts/45ik1y82_logo_anasayfa.png";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const scrollToNext = () => {
    document.getElementById('hizmetler')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="hero" 
      ref={heroRef} 
      className="relative h-screen overflow-hidden bg-black"
    >
      {/* Video/Image Background Layer */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
            style={{
              transform: `scale(1.1) translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px) translateY(${scrollY * 0.5}px)`
            }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          </div>
        ))}
      </div>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)"/%3E%3C/svg%3E")' }}
      />

      {/* Floating 3D Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large Gradient Orb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-500/20 to-transparent blur-3xl"
          style={{
            top: '10%',
            right: '-10%',
            transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`
          }}
        />
        
        {/* Floating Paw Shapes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-20"
            style={{
              top: `${15 + i * 15}%`,
              left: `${5 + i * 18}%`,
              transform: `translate(${mousePosition.x * (20 + i * 10)}px, ${mousePosition.y * (20 + i * 10)}px) rotate(${i * 30}deg)`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <svg viewBox="0 0 60 60" className="w-16 h-16 text-white animate-float" style={{ animationDelay: `${i * 0.8}s` }}>
              <circle cx="20" cy="15" r="8" fill="currentColor"/>
              <circle cx="40" cy="15" r="8" fill="currentColor"/>
              <circle cx="12" cy="28" r="6" fill="currentColor"/>
              <circle cx="48" cy="28" r="6" fill="currentColor"/>
              <path d="M15 35 Q20 55 30 45 Q40 55 45 35 Q40 50 30 40 Q20 50 15 35" fill="currentColor"/>
            </svg>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex">
        {/* Left Content */}
        <div className="flex-1 flex items-center px-8 md:px-16 lg:px-24">
          <div className="max-w-2xl">
            {/* Animated Line */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-teal-400 to-transparent animate-pulse" />
              <span className="text-teal-400 text-sm tracking-[0.3em] uppercase font-light">7/24 Acil Hizmet</span>
            </div>

            {/* Main Title - Artistic Typography */}
            <h1 className="mb-8">
              <span className="block text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight">
                <span className="inline-block overflow-hidden">
                  <span className="inline-block animate-slide-up" style={{ animationDelay: '0.2s' }}>DOSTLARINIZA</span>
                </span>
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl font-black leading-none tracking-tight mt-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-teal-500 animate-gradient" style={{ backgroundSize: '200% auto' }}>
                  ÖZEL BAKIM
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/70 font-light mb-12 max-w-lg leading-relaxed">
              Modern veteriner kliniğimizde minik dostlarınız için
              <span className="text-teal-400 font-medium"> premium sağlık </span>
              hizmetleri sunuyoruz.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-6">
              <button 
                data-cursor="Randevu"
                className="group relative px-10 py-5 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" />
                <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center gap-3 text-white font-semibold text-lg">
                  <Sparkles size={20} />
                  Randevu Al
                </span>
              </button>

              <button 
                data-cursor="İzle"
                className="group flex items-center gap-4 text-white/80 hover:text-white transition-colors"
              >
                <div className="relative w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-teal-400 transition-colors">
                  <Play size={24} className="ml-1" />
                  <div className="absolute inset-0 rounded-full border-2 border-teal-400 scale-0 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
                <span className="text-lg font-light">Kliniği Keşfet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Decorative */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative">
          {/* Floating Logo */}
          <div 
            className="relative"
            style={{
              transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`
            }}
          >
            <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full scale-150" />
            <img 
              src={LOGO_URL} 
              alt="Wetnose" 
              className="relative w-80 h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Slide Indicators - Vertical */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-4">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`group relative w-3 transition-all duration-500 ${
              index === currentSlide ? 'h-16' : 'h-3'
            }`}
          >
            <span className={`absolute inset-0 rounded-full transition-all duration-500 ${
              index === currentSlide 
                ? 'bg-teal-400' 
                : 'bg-white/30 group-hover:bg-white/50'
            }`} />
          </button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 text-white/60 hover:text-white transition-colors group"
      >
        <span className="text-xs tracking-[0.3em] uppercase">Keşfet</span>
        <div className="w-8 h-14 rounded-full border-2 border-current flex items-start justify-center p-2">
          <div className="w-1.5 h-4 bg-current rounded-full animate-bounce" />
        </div>
      </button>

      {/* Bottom Gradient Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-50 to-transparent" />
    </section>
  );
};

export default HeroSection;
