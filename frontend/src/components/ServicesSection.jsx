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

  return (
    <section 
      id="hizmetler" 
      ref={sectionRef}
      className="py-24 lg:py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header - Elegant */}
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-teal-500/50" />
            <span className="text-teal-600 text-xs tracking-[0.25em] uppercase font-medium">Hizmetlerimiz</span>
            <div className="h-px w-8 bg-teal-500/50" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
            Profesyonel <span className="font-semibold">Veteriner Hizmetleri</span>
          </h2>
          
          <p className="text-gray-500 max-w-xl mx-auto font-light">
            Dostlarınız için en ileri teknoloji ve uzman kadromuzla hizmetinizdeyiz
          </p>
        </div>

        {/* Services Grid - Clean & Minimal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Stethoscope;
            
            return (
              <div
                key={service.id}
                className={`group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="relative h-full bg-gray-50 rounded-2xl overflow-hidden hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    {/* Icon */}
                    <div className="absolute bottom-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-teal-600">
                      <IconComponent size={20} strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                      {service.name}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 font-light">
                      {service.description}
                    </p>
                    <button className="inline-flex items-center gap-1.5 text-teal-600 text-xs font-medium tracking-wide group-hover:gap-3 transition-all">
                      Detay
                      <ArrowRight size={12} strokeWidth={1.5} />
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
