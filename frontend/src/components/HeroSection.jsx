import React, { useState, useEffect, useRef } from 'react';
import { heroSlides } from '../data/mockData';
import { ChevronDown, ChevronLeft, ChevronRight, Heart, Activity } from 'lucide-react';

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

  // Floating Particles
  const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-teal-400/30 rounded-full animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${6 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );

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
                transform: `scale(1.05) translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`
              }}
            />
          </div>
        ))}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      
      {/* Animated Gradient Mesh */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)',
          transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
        }}
      />
      <div 
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, transparent 70%)',
          transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
        }}
      />

      {/* Particles */}
      <Particles />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Accent Line */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-12 bg-gradient-to-r from-teal-400 to-cyan-400" />
                <span className="text-teal-300 text-xs tracking-[0.3em] uppercase font-medium">Veteriner Kliniği</span>
              </div>

              {/* Main Title with Gradient */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
                Dostlarınıza
                <br />
                <span className="font-semibold gradient-text">Özel Bakım</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-white/70 font-light mb-10 leading-relaxed max-w-md">
                Modern teknoloji ve uzman kadromuzla minik dostlarınız için
                <span className="text-teal-300"> premium sağlık </span>
                hizmetleri sunuyoruz.
              </p>

              {/* CTA Buttons with Glow */}
              <div className="flex flex-wrap gap-4">
                <button className="group relative px-8 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium tracking-wide rounded-full overflow-hidden hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300">
                  <span className="relative z-10">Randevu Al</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button className="px-8 py-3.5 glass-dark text-white text-sm font-medium tracking-wide rounded-full hover:bg-white/20 transition-all duration-300">
                  Hizmetlerimiz
                </button>
              </div>
            </div>

            {/* Right - Holographic Health Card */}
            <div className="hidden lg:block">
              <div 
                className="relative"
                style={{
                  transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`
                }}
              >
                {/* Glassmorphism Card */}
                <div className="glass-dark rounded-3xl p-8 glow-teal">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                        <Activity size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Sağlık Durumu</div>
                        <div className="text-teal-400 text-xs">Canlı Takip</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <span className="text-green-400 text-xs font-medium">Mükemmel</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Heart Rate */}
                    <div className="glass-teal rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart size={16} className="text-red-400 animate-heartbeat" />
                        <span className="text-white/60 text-xs">Kalp Ritmi</span>
                      </div>
                      <div className="text-2xl font-semibold text-white">72 <span className="text-sm text-white/50">bpm</span></div>
                      {/* Wave Line */}
                      <div className="mt-2 h-8 relative overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 30">
                          <path
                            d="M0,15 Q10,15 15,15 T25,5 T35,25 T45,15 T55,15 T65,5 T75,25 T85,15 T100,15"
                            fill="none"
                            stroke="#14b8a6"
                            strokeWidth="2"
                            className="animate-pulse"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Oxygen */}
                    <div className="glass-teal rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-white/60 text-xs">Oksijen</span>
                      </div>
                      <div className="text-2xl font-semibold text-white">99<span className="text-sm text-white/50">%</span></div>
                      {/* Progress Bar */}
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[99%] bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Overall Health */}
                  <div className="glass-teal rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/60 text-xs mb-1">Genel Sağlık</div>
                        <div className="text-lg font-semibold text-teal-400">Mükemmel</div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 h-8 rounded-full bg-gradient-to-t from-teal-500 to-cyan-400" style={{ height: `${20 + i * 6}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-2 animate-float">
                  <span className="text-teal-600 text-xs font-semibold">7/24 Açık</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-24 right-8 z-20 flex flex-col gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide 
                ? 'w-2 h-8 bg-gradient-to-b from-teal-400 to-cyan-400 glow-teal' 
                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <div className="absolute bottom-24 left-8 z-20 flex gap-3">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white/70 hover:text-white hover:glow-teal transition-all"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white/70 hover:text-white hover:glow-teal transition-all"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Scroll Indicator */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50 hover:text-teal-400 transition-colors"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-light">Keşfet</span>
        <ChevronDown size={20} strokeWidth={1} className="animate-bounce" />
      </button>
    </section>
  );
};

export default HeroSection;
