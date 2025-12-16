import React, { useEffect, useRef, useState } from 'react';
import { adoptionPets, siteInfo } from '../data/mockData';
import { Heart, ArrowRight, Sparkles, PawPrint } from 'lucide-react';

const AdoptionSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [likedPets, setLikedPets] = useState([]);
  const [hoveredPet, setHoveredPet] = useState(null);

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

  return (
    <section 
      id="sahiplendirme" 
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Split Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500" />
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-white hidden lg:block" />
      </div>

      {/* Animated Pattern on Left */}
      <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '25px 25px'
          }} />
        </div>
        {/* Floating Paws */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/10 animate-float"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <PawPrint size={40 + i * 10} />
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`text-white transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={16} className="text-teal-200" />
              <span className="text-teal-100 text-xs tracking-[0.3em] uppercase font-medium">Sahiplendirme</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 leading-tight">
              Bir Dost
              <br />
              <span className="font-semibold text-teal-100">Edinin</span>
            </h2>

            <p className="text-white/80 font-light leading-relaxed mb-10 max-w-md">
              {siteInfo.description} Sevgi dolu bir yuvayı bekleyen minik dostlarımıza göz atın.
            </p>

            {/* Stats with Glassmorphism */}
            <div className="flex gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-3xl font-semibold text-white mb-1">50+</div>
                <div className="text-teal-100 text-xs uppercase tracking-wider">Bekleyen Dost</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-3xl font-semibold text-white mb-1">200+</div>
                <div className="text-teal-100 text-xs uppercase tracking-wider">Mutlu Yuva</div>
              </div>
            </div>

            <button className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white text-teal-600 text-sm font-medium tracking-wide rounded-full hover:shadow-xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5">
              Tümünü Gör
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right - Pet Cards */}
          <div className={`transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {adoptionPets.slice(0, 2).map((pet, index) => {
                const isLiked = likedPets.includes(pet.id);
                const isHovered = hoveredPet === pet.id;
                
                return (
                  <div
                    key={pet.id}
                    className="group"
                    onMouseEnter={() => setHoveredPet(pet.id)}
                    onMouseLeave={() => setHoveredPet(null)}
                  >
                    <div className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-500 ${
                      isHovered ? 'shadow-2xl shadow-teal-500/20 -translate-y-2' : 'shadow-xl'
                    }`}>
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        
                        {/* Like Button with Animation */}
                        <button 
                          onClick={() => toggleLike(pet.id)}
                          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isLiked 
                              ? 'bg-red-500 text-white scale-110' 
                              : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart size={18} className={`transition-transform duration-300 ${
                            isLiked ? 'fill-current animate-heartbeat' : ''
                          }`} />
                        </button>

                        {/* Type Badge */}
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-medium rounded-full shadow-lg">
                          {pet.type}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-semibold text-gray-800">{pet.name}</h3>
                          <span className="text-gray-400 text-xs">{pet.age}</span>
                        </div>
                        <p className="text-gray-500 text-xs font-light">{pet.description}</p>
                      </div>

                      {/* Bottom Glow */}
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform transition-transform duration-300 origin-left ${
                        isHovered ? 'scale-x-100' : 'scale-x-0'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdoptionSection;
