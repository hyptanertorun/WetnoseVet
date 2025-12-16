import React, { useEffect, useRef, useState } from 'react';
import { adoptionPets, siteInfo } from '../data/mockData';
import { Heart, Info, PawPrint, Sparkles, ArrowRight } from 'lucide-react';

const AdoptionSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [likedPets, setLikedPets] = useState([]);

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

  const toggleLike = (petId) => {
    setLikedPets(prev => 
      prev.includes(petId) 
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    );
  };

  // Floating Paw Component
  const FloatingPaw = ({ className, delay, size = 60, rotation = 0 }) => (
    <div 
      className={`absolute pointer-events-none ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg 
        viewBox="0 0 60 60" 
        style={{ width: size, height: size, animationDelay: delay }}
        className="opacity-10 animate-float text-white"
      >
        <circle cx="20" cy="15" r="8" fill="currentColor"/>
        <circle cx="40" cy="15" r="8" fill="currentColor"/>
        <circle cx="12" cy="28" r="6" fill="currentColor"/>
        <circle cx="48" cy="28" r="6" fill="currentColor"/>
        <path d="M15 35 Q20 55 30 45 Q40 55 45 35 Q40 50 30 40 Q20 50 15 35" fill="currentColor"/>
      </svg>
    </div>
  );

  return (
    <section 
      id="sahiplendirme" 
      ref={sectionRef}
      className="py-28 relative overflow-hidden"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
      
      {/* Animated Wave Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute bottom-0 w-[200%] animate-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="white" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      {/* Floating Paws */}
      <FloatingPaw className="top-[10%] left-[5%]" delay="0s" size={70} rotation={-15} />
      <FloatingPaw className="top-[30%] right-[8%]" delay="1s" size={90} rotation={20} />
      <FloatingPaw className="bottom-[25%] left-[15%]" delay="2s" size={50} rotation={-30} />
      <FloatingPaw className="bottom-[40%] right-[20%]" delay="0.5s" size={60} rotation={45} />
      <FloatingPaw className="top-[60%] left-[40%]" delay="1.5s" size={40} rotation={10} />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium mb-6">
            <PawPrint size={16} />
            Yuva Arıyorlar
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            SAHİPLENDİRME
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {siteInfo.description}
          </p>
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-2 h-2 bg-white/50 rounded-full" />
            <span className="w-20 h-1 bg-white/50 rounded-full" />
            <span className="w-2 h-2 bg-white/50 rounded-full" />
          </div>
        </div>

        {/* Pets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {adoptionPets.map((pet, index) => {
            const isLiked = likedPets.includes(pet.id);
            
            return (
              <div
                key={pet.id}
                className={`group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl hover:-translate-y-4 transition-all duration-500">
                  {/* Image */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Heart Button */}
                    <button 
                      onClick={() => toggleLike(pet.id)}
                      className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
                        isLiked 
                          ? 'bg-red-500 text-white scale-110' 
                          : 'bg-white/90 text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart size={22} className={isLiked ? 'fill-current animate-pulse' : ''} />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute bottom-4 left-4 px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-full shadow-lg">
                      {pet.type}
                    </div>

                    {/* Name on Image */}
                    <div className="absolute bottom-4 right-4 text-right">
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">{pet.name}</h3>
                      <span className="text-white/80 text-sm">{pet.age}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-6">{pet.description}</p>
                    <button className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/30 group/btn">
                      <Info size={18} />
                      <span>Detaylı Bilgi</span>
                      <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button className="group px-10 py-5 bg-white text-teal-600 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-3">
            Tümünü Görüntüle
            <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdoptionSection;
