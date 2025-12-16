import React, { useEffect, useRef, useState } from 'react';
import { adoptionPets, siteInfo } from '../data/mockData';
import { Heart, ArrowRight } from 'lucide-react';

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

  return (
    <section 
      id="sahiplendirme" 
      ref={sectionRef}
      className="py-24 lg:py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-teal-500/50" />
              <span className="text-teal-600 text-xs tracking-[0.25em] uppercase font-medium">Sahiplendirme</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
              Bir Dost <span className="font-semibold">Edinin</span>
            </h2>

            <p className="text-gray-500 font-light leading-relaxed mb-8">
              {siteInfo.description} Sevgi dolu bir yuvayı bekleyen minik dostlarımıza göz atın.
            </p>

            {/* Stats */}
            <div className="flex gap-12 mb-8">
              <div>
                <div className="text-3xl font-light text-teal-600">50+</div>
                <div className="text-gray-500 text-sm font-light">Bekleyen Dost</div>
              </div>
              <div>
                <div className="text-3xl font-light text-teal-600">200+</div>
                <div className="text-gray-500 text-sm font-light">Mutlu Yuva</div>
              </div>
            </div>

            <button className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-medium tracking-wide rounded-full hover:bg-teal-700 transition-colors">
              Tümünü Gör
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Right - Pet Cards */}
          <div className={`transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adoptionPets.slice(0, 2).map((pet, index) => {
                const isLiked = likedPets.includes(pet.id);
                
                return (
                  <div
                    key={pet.id}
                    className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-500"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      
                      {/* Like Button */}
                      <button 
                        onClick={() => toggleLike(pet.id)}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart size={16} strokeWidth={1.5} className={isLiked ? 'fill-current' : ''} />
                      </button>

                      {/* Type Badge */}
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full">
                        {pet.type}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-800">{pet.name}</h3>
                        <span className="text-gray-400 text-xs">{pet.age}</span>
                      </div>
                      <p className="text-gray-500 text-xs font-light">{pet.description}</p>
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
