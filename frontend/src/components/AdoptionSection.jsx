import React, { useEffect, useRef, useState } from 'react';
import { adoptionPets, siteInfo } from '../data/mockData';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';

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
      className="relative min-h-screen overflow-hidden"
    >
      {/* Split Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700" />
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-white hidden lg:block" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 border border-white/20 rounded-full" />
      <div className="absolute bottom-20 left-40 w-32 h-32 border border-white/10 rounded-full" />

      <div className="relative min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`text-white transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <Sparkles size={20} className="text-teal-200" />
                <span className="text-teal-200 text-sm tracking-[0.3em] uppercase font-medium">Sahiplendirme</span>
              </div>

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-8">
                BİR DOST
                <br />
                <span className="text-teal-200">EDİNİN</span>
              </h2>

              <p className="text-xl text-white/80 leading-relaxed mb-12 max-w-lg">
                {siteInfo.description} Her biri sevgi dolu bir yuvayı bekliyor.
              </p>

              {/* Stats */}
              <div className="flex gap-12 mb-12">
                <div>
                  <div className="text-5xl font-black text-white">50+</div>
                  <div className="text-teal-200 text-sm uppercase tracking-wider">Bekleyen Dost</div>
                </div>
                <div>
                  <div className="text-5xl font-black text-white">200+</div>
                  <div className="text-teal-200 text-sm uppercase tracking-wider">Mutlu Yuva</div>
                </div>
              </div>

              <button className="group px-10 py-5 bg-white text-teal-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-3">
                Tümünü Gör
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            {/* Right - Pet Cards */}
            <div className={`relative transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              {/* Stacked Cards */}
              <div className="relative h-[600px]">
                {adoptionPets.map((pet, index) => {
                  const isLiked = likedPets.includes(pet.id);
                  const isHovered = hoveredPet === pet.id;
                  
                  return (
                    <div
                      key={pet.id}
                      data-cursor="Sahiplen"
                      className="absolute w-full max-w-sm transition-all duration-500 cursor-pointer"
                      style={{
                        top: `${index * 30}px`,
                        left: `${index * 30}px`,
                        zIndex: isHovered ? 10 : adoptionPets.length - index,
                        transform: isHovered ? 'scale(1.05) rotate(0deg)' : `rotate(${(index - 1) * 3}deg)`
                      }}
                      onMouseEnter={() => setHoveredPet(pet.id)}
                      onMouseLeave={() => setHoveredPet(null)}
                    >
                      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                        {/* Image */}
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={pet.image}
                            alt={pet.name}
                            className="w-full h-full object-cover transition-transform duration-500"
                            style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          
                          {/* Like Button */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleLike(pet.id); }}
                            className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                              isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
                            }`}
                          >
                            <Heart size={22} className={isLiked ? 'fill-current' : ''} />
                          </button>

                          {/* Type Badge */}
                          <div className="absolute bottom-4 left-4 px-4 py-1.5 bg-teal-500 text-white text-sm font-medium rounded-full">
                            {pet.type}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{pet.name}</h3>
                            <span className="text-gray-500 text-sm">{pet.age}</span>
                          </div>
                          <p className="text-gray-600">{pet.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdoptionSection;
