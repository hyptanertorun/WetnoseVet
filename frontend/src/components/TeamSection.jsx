import React, { useEffect, useRef, useState } from 'react';
import { team } from '../data/mockData';
import { Mail, Phone, Award, Star } from 'lucide-react';

const TeamSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredMember, setHoveredMember] = useState(null);
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

  const handleMouseMove = (e, memberId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    setMousePos({ x, y });
    setHoveredMember(memberId);
  };

  return (
    <section 
      id="ekip" 
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden bg-gray-50"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Gradient Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 lg:mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-teal-500" />
            <span className="text-teal-600 text-xs tracking-[0.3em] uppercase font-medium">Ekibimiz</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-teal-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-4">
            Uzman <span className="font-semibold gradient-text">Veteriner Kadromuz</span>
          </h2>
          
          <p className="text-gray-500 max-w-xl mx-auto font-light">
            Deneyimli hekimlerimiz ile dostlarınız emin ellerde
          </p>
        </div>

        {/* Team Cards with 3D Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, index) => {
            const isHovered = hoveredMember === member.id;
            
            return (
              <div
                key={member.id}
                className={`group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  transform: isHovered ? `perspective(1000px) rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg)` : 'none'
                }}
                onMouseMove={(e) => handleMouseMove(e, member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <div className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-500 ${
                  isHovered ? 'shadow-2xl shadow-teal-500/20' : 'shadow-xl shadow-gray-200/50'
                }`}>
                  {/* Spotlight Effect */}
                  {isHovered && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{
                        background: `radial-gradient(circle at ${(mousePos.x + 5) * 10}% ${(mousePos.y + 5) * 10}%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)`
                      }}
                    />
                  )}

                  {/* Image */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Rating Stars */}
                    <div className="absolute top-4 left-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    
                    {/* Overlay Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={14} strokeWidth={1.5} className="text-teal-300" />
                        <span className="text-teal-200 text-xs font-medium tracking-wide">{member.title}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-500 text-sm font-light mb-5">{member.specialization}</p>
                    
                    {/* Contact Buttons with Glow */}
                    <div className="flex gap-3">
                      <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isHovered 
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' 
                          : 'bg-gray-100 text-gray-500 hover:bg-teal-500 hover:text-white'
                      }`}>
                        <Phone size={16} strokeWidth={1.5} />
                      </button>
                      <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isHovered 
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' 
                          : 'bg-gray-100 text-gray-500 hover:bg-teal-500 hover:text-white'
                      }`}>
                        <Mail size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Glow Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 transform transition-transform duration-500 ${
                    isHovered ? 'scale-x-100' : 'scale-x-0'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
