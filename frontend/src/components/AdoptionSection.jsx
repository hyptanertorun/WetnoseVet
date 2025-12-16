import React, { useEffect, useRef, useState } from 'react';
import { adoptionPets, siteInfo } from '../data/mockData';
import { Heart, Info, PawPrint } from 'lucide-react';

const AdoptionSection = () => {
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
      id="sahiplendirme" 
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-white">
          <PawPrint size={60} />
        </div>
        <div className="absolute top-40 right-20 text-white rotate-12">
          <PawPrint size={80} />
        </div>
        <div className="absolute bottom-20 left-1/4 text-white -rotate-12">
          <PawPrint size={50} />
        </div>
        <div className="absolute bottom-40 right-1/3 text-white rotate-45">
          <PawPrint size={70} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4">
            Yuva Arıyorlar
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            SAHİPLENDİRME
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {siteInfo.description}
          </p>
          <div className="w-24 h-1 bg-white/50 mx-auto mt-6 rounded-full" />
        </div>

        {/* Pets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {adoptionPets.map((pet, index) => (
            <div
              key={pet.id}
              className={`group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Heart Button */}
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all duration-300 shadow-lg group-hover:scale-110">
                    <Heart size={20} />
                  </button>

                  {/* Type Badge */}
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-teal-500 text-white text-sm font-medium rounded-full">
                    {pet.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                    <span className="text-sm text-gray-500">{pet.age}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{pet.description}</p>
                  <button className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-500/30">
                    <Info size={18} />
                    Detaylı Bilgi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button className="px-8 py-4 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            Tümünü Görüntüle
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdoptionSection;
