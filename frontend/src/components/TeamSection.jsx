import React, { useEffect, useRef, useState } from 'react';
import { team } from '../data/mockData';
import { Mail, Phone, Linkedin, Instagram, Award } from 'lucide-react';

const TeamSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
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
    setActiveCard(cardId);
  };

  return (
    <section 
      id="ekip" 
      ref={sectionRef}
      className="relative min-h-screen bg-white overflow-hidden py-32"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-50/50 to-transparent" />
      </div>

      {/* Decorative Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gray-200 rounded-full opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gray-200 rounded-full opacity-30" />

      <div className="relative max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className={`text-center mb-24 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-20 bg-teal-500" />
            <span className="text-teal-600 text-sm tracking-[0.3em] uppercase font-medium">Ekibimiz</span>
            <div className="h-px w-20 bg-teal-500" />
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-none mb-6">
            UZMAN
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600"> KADRO</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Deneyimli veteriner hekimlerimiz ile dostlarınız emin ellerde
          </p>
        </div>

        {/* Team Cards - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {team.map((member, index) => (
            <div
              key={member.id}
              className={`group relative transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
              onMouseMove={(e) => handleMouseMove(e, member.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div 
                className="relative h-[600px] rounded-[3rem] overflow-hidden"
                style={{
                  transform: activeCard === member.id 
                    ? `perspective(1000px) rotateY(${(mousePos.x - 0.5) * 10}deg) rotateX(${(mousePos.y - 0.5) * -10}deg)`
                    : 'none',
                  transition: activeCard === member.id ? 'none' : 'transform 0.5s ease-out'
                }}
              >
                {/* Image */}
                <div className="absolute inset-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>

                {/* Spotlight Effect */}
                {activeCard === member.id && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)`
                    }}
                  />
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-10">
                  {/* Badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-teal-300 text-sm font-medium flex items-center gap-2">
                      <Award size={16} />
                      {member.title}
                    </div>
                  </div>

                  <h3 className="text-4xl font-black text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-teal-400 text-lg font-medium mb-8">
                    {member.specialization}
                  </p>

                  {/* Social Links */}
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {[Phone, Mail, Linkedin, Instagram].map((Icon, i) => (
                      <button 
                        key={i}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-teal-500 transition-colors"
                      >
                        <Icon size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Index Number */}
                <span className="absolute top-10 right-10 text-[150px] font-black text-white/5 leading-none">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
