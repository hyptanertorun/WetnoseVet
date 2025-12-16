import React, { useEffect, useRef, useState } from 'react';
import { services } from '../data/mockData';
import { 
  FlaskConical, Scan, Ambulance, Droplet, Stethoscope, 
  HeartPulse, Scissors, Sparkles, ArrowRight, ChevronRight 
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
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e, cardId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePos({ x, y });
    setHoveredCard(cardId);
  };

  return (
    <section 
      id="hizmetler" 
      ref={sectionRef}
      className="py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-morph" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl animate-morph" style={{ animationDelay: '4s' }} />
      
      {/* Floating Decorations */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-teal-400 rounded-full animate-float opacity-40" />
      <div className="absolute top-40 left-[10%] w-3 h-3 bg-teal-300 rounded-full animate-float opacity-30" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 right-[15%] w-5 h-5 bg-teal-500 rounded-full animate-float opacity-20" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-600 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Sparkles size={16} className="animate-pulse" />
            Profesyonel Hizmetler
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            HİZMETLERİMİZ
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dostlarınız için en iyi veteriner hizmetlerini sunuyoruz
          </p>
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-2 h-2 bg-teal-300 rounded-full" />
            <span className="w-20 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            <span className="w-2 h-2 bg-teal-300 rounded-full" />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Stethoscope;
            const isHovered = hoveredCard === service.id;
            
            return (
              <div
                key={service.id}
                className={`group relative transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                }`}
                style={{ 
                  transitionDelay: `${index * 80}ms`,
                  transform: isHovered 
                    ? `perspective(1000px) rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg) translateZ(10px)` 
                    : 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)'
                }}
                onMouseMove={(e) => handleMouseMove(e, service.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-full bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-teal-500/10">
                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Card Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    
                    {/* Floating Icon Badge */}
                    <div className="absolute top-4 right-4 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-teal-500 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-teal-500 group-hover:text-white">
                      <IconComponent size={26} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Service Name on Image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">
                        {service.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-2">
                      {service.description}
                    </p>
                    <button className="group/btn inline-flex items-center gap-2 text-teal-600 font-semibold text-sm transition-all duration-300 hover:gap-4">
                      <span>Detaylı Bilgi</span>
                      <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button className="group relative px-10 py-5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-semibold text-lg overflow-hidden shadow-xl shadow-teal-500/25 hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-500 hover:-translate-y-1">
            <span className="relative z-10 flex items-center gap-3">
              Tüm Hizmetleri Görüntüle
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
