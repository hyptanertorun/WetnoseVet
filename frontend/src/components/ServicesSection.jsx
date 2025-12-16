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
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
    setHoveredCard(cardId);
  };

  return (
    <section 
      id="hizmetler" 
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 dot-pattern opacity-50" />
      
      {/* Gradient Blobs */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-morph" />
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-morph" style={{ animationDelay: '4s' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-teal-500" />
            <span className="text-teal-600 text-xs tracking-[0.3em] uppercase font-medium">Hizmetlerimiz</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-teal-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-4">
            Profesyonel <span className="font-semibold gradient-text">Veteriner Hizmetleri</span>
          </h2>
          
          <p className="text-gray-500 max-w-xl mx-auto font-light">
            En ileri teknoloji ve uzman kadromuzla 7/24 hizmetinizdeyiz
          </p>
        </div>

        {/* Services Grid with Glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Stethoscope;
            const isHovered = hoveredCard === service.id;
            
            return (
              <div
                key={service.id}
                className={`group relative transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
                onMouseMove={(e) => handleMouseMove(e, service.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`relative h-full bg-white rounded-2xl overflow-hidden transition-all duration-500 ${
                  isHovered ? 'shadow-2xl shadow-teal-500/20 -translate-y-2' : 'shadow-lg shadow-gray-200/50'
                }`}>
                  {/* Spotlight Effect */}
                  {isHovered && (
                    <div 
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)`
                      }}
                    />
                  )}

                  {/* Glow Border on Hover */}
                  <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`} style={{
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3), transparent, rgba(6, 182, 212, 0.3))',
                    padding: '1px'
                  }}>
                    <div className="w-full h-full bg-white rounded-2xl" />
                  </div>

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                    
                    {/* Icon Badge with Glow */}
                    <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isHovered 
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white glow-teal' 
                        : 'glass text-teal-600'
                    }`}>
                      <IconComponent size={22} strokeWidth={1.5} />
                    </div>

                    {/* Index Number */}
                    <div className="absolute top-4 right-4 text-white/20 text-4xl font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-5">
                    <h3 className={`text-sm font-semibold mb-2 tracking-wide transition-colors duration-300 ${
                      isHovered ? 'text-teal-600' : 'text-gray-800'
                    }`}>
                      {service.name}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 font-light">
                      {service.description}
                    </p>
                    <button className={`inline-flex items-center gap-2 text-xs font-medium tracking-wide transition-all duration-300 ${
                      isHovered ? 'gap-3 text-teal-500' : 'text-teal-600'
                    }`}>
                      Detay
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
