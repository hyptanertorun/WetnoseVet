import React, { useState, useEffect, useRef } from 'react';
import { heroSlides, siteInfo } from '../data/mockData';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState('');
  const heroRef = useRef(null);

  // Typing animation
  useEffect(() => {
    const text = heroSlides[currentSlide].title;
    setTypedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i <= text.length) {
        setTypedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [currentSlide]);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  // Floating Paw Component
  const FloatingPaw = ({ className, delay, size = 60 }) => (
    <div 
      className={`absolute pointer-events-none ${className}`}
      style={{ 
        animationDelay: delay,
        transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
      }}
    >
      <svg 
        viewBox="0 0 60 60" 
        style={{ width: size, height: size }}
        className="opacity-20 animate-float text-white"
      >
        <circle cx="20" cy="15" r="8" fill="currentColor"/>
        <circle cx="40" cy="15" r="8" fill="currentColor"/>
        <circle cx="12" cy="28" r="6" fill="currentColor"/>
        <circle cx="48" cy="28" r="6" fill="currentColor"/>
        <path d="M15 35 Q20 55 30 45 Q40 55 45 35 Q40 50 30 40 Q20 50 15 35" fill="currentColor"/>
      </svg>
    </div>
  );

  // Particle Effect
  const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <section id="hero" ref={heroRef} className="relative h-screen overflow-hidden">
      {/* Floating Paws with Parallax */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <FloatingPaw className="top-[15%] left-[8%]" delay="0s" size={80} />
        <FloatingPaw className="top-[65%] left-[3%]" delay="1.5s" size={50} />
        <FloatingPaw className="top-[25%] right-[12%]" delay="0.8s" size={90} />
        <FloatingPaw className="top-[75%] right-[8%]" delay="2s" size={40} />
        <FloatingPaw className="top-[85%] left-[35%]" delay="1s" size={35} />
        <FloatingPaw className="top-[45%] right-[25%]" delay="2.5s" size={55} />
      </div>

      {/* Particles */}
      <Particles />

      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1500 ease-out ${
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          }`}
        >
          {/* Background Image with Ken Burns Effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: `scale(${index === currentSlide ? 1.1 : 1}) translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`,
              transition: 'transform 8s ease-out'
            }}
          />
          {/* Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-teal-900/20" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl">
            {/* Animated Badge */}
            <div 
              className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500/30 to-teal-400/20 backdrop-blur-md border border-teal-400/40 rounded-full text-teal-300 text-sm mb-8 transition-all duration-700 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-ping" />
              <span>7/24 Acil Hizmet</span>
            </div>

            {/* Main Title with Typing Effect */}
            <h1 
              className={`text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-700 delay-100 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <span className="relative">
                {typedText}
                <span className="animate-blink">|</span>
              </span>
            </h1>

            {/* Subtitle with Fade */}
            <p 
              className={`text-xl md:text-2xl text-gray-300 mb-10 transition-all duration-700 delay-200 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* CTA Buttons with Hover Effects */}
            <div 
              className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <button className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-semibold overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Randevu Al
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </span>
              </button>
              <button className="group px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-full font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center gap-2">
                <div className="relative w-6 h-6">
                  <Play className="w-5 h-5 absolute inset-0.5 group-hover:scale-110 transition-transform" />
                  <span className="absolute inset-0 border-2 border-white/50 rounded-full animate-ping opacity-0 group-hover:opacity-75" />
                </div>
                Kliniğimizi Tanıyın
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        <button
          onClick={prevSlide}
          className="group p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-teal-500 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
        
        <div className="flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="group relative"
            >
              <span className={`block transition-all duration-500 rounded-full ${
                index === currentSlide 
                  ? 'w-10 h-3 bg-gradient-to-r from-teal-400 to-teal-500' 
                  : 'w-3 h-3 bg-white/40 hover:bg-white/60'
              }`} />
              {index === currentSlide && (
                <span className="absolute inset-0 rounded-full bg-teal-400/50 animate-ping" />
              )}
            </button>
          ))}
        </div>
        
        <button
          onClick={nextSlide}
          className="group p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-teal-500 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 right-10 z-30 hidden lg:flex flex-col items-center gap-3 text-white/60">
        <span className="text-xs tracking-widest writing-vertical">SCROLL</span>
        <div className="w-6 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-teal-400 rounded-full animate-bounce" />
        </div>
      </div>

      {/* Bottom Gradient Wave */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-gray-50">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
