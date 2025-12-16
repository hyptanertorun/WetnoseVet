import React, { useState, useEffect } from 'react';
import { heroSlides, siteInfo } from '../data/mockData';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const PawPrint = ({ className, delay }) => (
    <svg 
      viewBox="0 0 60 60" 
      className={`absolute opacity-10 animate-float ${className}`}
      style={{ animationDelay: delay }}
    >
      <circle cx="20" cy="15" r="8" fill="currentColor"/>
      <circle cx="40" cy="15" r="8" fill="currentColor"/>
      <circle cx="12" cy="28" r="6" fill="currentColor"/>
      <circle cx="48" cy="28" r="6" fill="currentColor"/>
      <path d="M15 35 Q20 55 30 45 Q40 55 45 35 Q40 50 30 40 Q20 50 15 35" fill="currentColor"/>
    </svg>
  );

  return (
    <section id="hero" className="relative h-screen overflow-hidden">
      {/* Animated Paw Prints Background */}
      <div className="absolute inset-0 z-10 pointer-events-none text-white">
        <PawPrint className="w-20 h-20 top-[20%] left-[10%]" delay="0s" />
        <PawPrint className="w-16 h-16 top-[60%] left-[5%]" delay="1s" />
        <PawPrint className="w-24 h-24 top-[30%] right-[15%]" delay="2s" />
        <PawPrint className="w-14 h-14 top-[70%] right-[10%]" delay="0.5s" />
        <PawPrint className="w-12 h-12 top-[80%] left-[30%]" delay="1.5s" />
      </div>

      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-110'
          }`}
        >
          {/* Background Image with Parallax Effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-[8000ms]"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)'
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl">
            {/* Animated Badge */}
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full text-teal-300 text-sm mb-6 transition-all duration-700 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              7/24 Acil Hizmet
            </div>

            {/* Main Title */}
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-700 delay-100 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {heroSlides[currentSlide].title}
            </h1>

            {/* Subtitle */}
            <p 
              className={`text-xl md:text-2xl text-gray-300 mb-8 transition-all duration-700 delay-200 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <button className="group px-8 py-4 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 flex items-center gap-2">
                Randevu Al
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Kliniğimizi Tanıyın
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        <button
          onClick={prevSlide}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-teal-500 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 h-2 bg-teal-500 rounded-full' 
                  : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/80'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={nextSlide}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-teal-500 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-30 hidden lg:flex flex-col items-center gap-2 text-white/60">
        <span className="text-xs tracking-widest rotate-90 origin-center translate-y-8">SCROLL</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
          <div className="w-1.5 h-3 bg-teal-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
