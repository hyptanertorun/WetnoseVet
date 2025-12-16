import React, { useEffect, useRef, useState } from 'react';
import { services } from '../data/mockData';
import { 
  FlaskConical, Scan, Ambulance, Droplet, Stethoscope, 
  HeartPulse, Scissors, Sparkles, ArrowRight 
} from 'lucide-react';

const iconMap = {
  flask: FlaskConical,
  scan: Scan,
  ambulance: Ambulance,
  droplet: Droplet,
  stethoscope: Stethoscope,
  'heart-pulse': HeartPulse,
  scissors: Scissors,
  sparkles: Sparkles
};

const ServicesSection = () => {
  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Horizontal scroll on wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      // Only handle horizontal scroll when section is in view
      if (rect.top <= 100 && rect.bottom >= window.innerHeight - 100) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;
        
        // Check if we should scroll horizontally
        if ((e.deltaY > 0 && currentScroll < maxScroll - 10) || 
            (e.deltaY < 0 && currentScroll > 10)) {
          e.preventDefault();
          container.scrollLeft += e.deltaY * 2;
          setScrollProgress(container.scrollLeft / maxScroll);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <section 
      id="hizmetler" 
      ref={sectionRef}
      className="relative min-h-screen bg-gray-50 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-50 to-transparent" />
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-teal-500/5 blur-3xl animate-float" />
      <div className="absolute bottom-40 right-40 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative py-32">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-8 mb-20">
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-20 bg-teal-500" />
              <span className="text-teal-600 text-sm tracking-[0.3em] uppercase font-medium">Hizmetlerimiz</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-none">
                  PROFESYONEL
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
                    VETERİNER
                  </span>
                  <br />
                  HİZMETLERİ
                </h2>
              </div>
              
              <p className="hidden lg:block max-w-md text-gray-600 text-lg leading-relaxed">
                Dostlarınız için en ileri teknoloji ve uzman kadromuzla
                <span className="text-teal-600 font-semibold"> 7/24 </span>
                hizmetinizdeyiz.
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide px-8 pb-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Spacer */}
          <div className="flex-shrink-0 w-[calc(50vw-400px)] hidden lg:block" />
          
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Stethoscope;
            
            return (
              <div
                key={service.id}
                data-cursor="Keşfet"
                className={`group flex-shrink-0 w-[350px] md:w-[400px] snap-center transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative h-[500px] bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-4">
                  {/* Image */}
                  <div className="absolute inset-0">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-teal-500 transition-colors duration-300">
                      <IconComponent size={28} />
                    </div>

                    {/* Number */}
                    <span className="text-white/30 text-8xl font-black absolute top-8 right-8">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <h3 className="text-2xl font-bold text-white mb-3">
                      {service.name}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-2">
                      {service.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-3 text-teal-400 font-medium opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <span>Detaylı Bilgi</span>
                      <ArrowRight size={18} />
                    </div>
                  </div>

                  {/* Hover Border */}
                  <div className="absolute inset-0 border-2 border-teal-400 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            );
          })}

          {/* Spacer */}
          <div className="flex-shrink-0 w-[calc(50vw-400px)] hidden lg:block" />
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto px-8 mt-12">
          <div className="flex items-center gap-6">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, scrollProgress * 100)}%` }}
              />
            </div>
            <span className="text-gray-400 font-mono text-sm">
              {String(Math.round(scrollProgress * services.length) + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
