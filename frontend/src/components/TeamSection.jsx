import React, { useEffect, useRef, useState } from 'react';
import { team } from '../data/mockData';
import { Mail, Phone, Linkedin, Award, Star, Sparkles } from 'lucide-react';

const TeamSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredMember, setHoveredMember] = useState(null);

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
      className="py-28 bg-white relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-40 h-40 border-4 border-teal-100 rounded-full opacity-50 animate-rotate" style={{ animationDuration: '30s' }} />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-teal-50 to-transparent rounded-2xl rotate-12 animate-float" />
      <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-teal-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-600 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Award size={16} />
            Uzman Kadro
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            EKİBİMİZ
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Deneyimli veteriner hekimlerimiz ile dostlarınız güvende
          </p>
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-2 h-2 bg-teal-300 rounded-full" />
            <span className="w-20 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            <span className="w-2 h-2 bg-teal-300 rounded-full" />
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <div
              key={member.id}
              className={`group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full -translate-y-20 translate-x-20" />
                
                <div className="flex flex-col md:flex-row">
                  {/* Image Container */}
                  <div className="relative w-full md:w-2/5 h-72 md:h-auto overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white via-transparent to-transparent" />
                    
                    {/* Rating Stars */}
                    <div className="absolute top-4 left-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className="fill-yellow-400 text-yellow-400 drop-shadow-sm"
                          style={{ animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-600 rounded-full text-xs font-semibold mb-4 w-fit">
                      <Sparkles size={12} />
                      {member.title}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-teal-600 font-medium mb-6">
                      {member.specialization}
                    </p>

                    {/* Social/Contact Icons */}
                    <div className="flex gap-3">
                      {[Phone, Mail, Linkedin].map((Icon, i) => (
                        <button 
                          key={i}
                          className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-teal-500 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-sm hover:shadow-lg"
                          style={{ transitionDelay: `${i * 50}ms` }}
                        >
                          <Icon size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
