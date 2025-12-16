import React, { useEffect, useRef, useState } from 'react';
import { team } from '../data/mockData';
import { Mail, Phone, Linkedin, Award } from 'lucide-react';

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
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border-4 border-teal-100 rounded-full opacity-50" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-teal-50 rounded-2xl rotate-12" />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-block px-4 py-2 bg-teal-100 text-teal-600 rounded-full text-sm font-medium mb-4">
            Uzman Kadro
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            EKİBİMİZ
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Deneyimli veteriner hekimlerimiz ile dostlarınız güvende
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-teal-600 mx-auto mt-6 rounded-full" />
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <div
              key={member.id}
              className={`group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-teal-900/20 to-transparent" />
                  
                  {/* Social Links Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex gap-3 justify-center">
                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                        <Phone size={18} />
                      </button>
                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                        <Mail size={18} />
                      </button>
                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                        <Linkedin size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-xs font-medium mb-3">
                    <Award size={14} />
                    {member.title}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-teal-600 text-sm">
                    {member.specialization}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500 translate-x-10 -translate-y-10 rotate-45" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
