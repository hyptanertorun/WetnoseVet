import React, { useEffect, useRef, useState } from 'react';
import { team } from '../data/mockData';
import { Mail, Phone, Award } from 'lucide-react';

const TeamSection = () => {
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
      id="ekip" 
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-teal-500/50" />
            <span className="text-teal-600 text-xs tracking-[0.25em] uppercase font-medium">Ekibimiz</span>
            <div className="h-px w-8 bg-teal-500/50" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
            Uzman <span className="font-semibold">Veteriner Kadromuz</span>
          </h2>
          
          <p className="text-gray-500 max-w-xl mx-auto font-light">
            Deneyimli hekimlerimiz ile dostlarınız emin ellerde
          </p>
        </div>

        {/* Team Cards - Elegant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <div
              key={member.id}
              className={`group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500">
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={14} strokeWidth={1.5} className="text-teal-300" />
                      <span className="text-teal-200 text-xs font-medium tracking-wide">{member.title}</span>
                    </div>
                    <h3 className="text-xl font-medium text-white">{member.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-500 text-sm font-light mb-4">{member.specialization}</p>
                  <div className="flex gap-3">
                    <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-teal-500 hover:text-white transition-colors">
                      <Phone size={16} strokeWidth={1.5} />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-teal-500 hover:text-white transition-colors">
                      <Mail size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
