import React, { useEffect, useRef, useState } from 'react';
import { news } from '../data/mockData';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

const NewsSection = () => {
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
      id="haberler" 
      ref={sectionRef}
      className="py-24 bg-gray-50 relative overflow-hidden"
    >
      {/* Decorative Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-block px-4 py-2 bg-teal-100 text-teal-600 rounded-full text-sm font-medium mb-4">
            Blog & Haberler
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            BİZDEN HABERLER
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veteriner sağlığı hakkında en güncel bilgiler
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-teal-600 mx-auto mt-6 rounded-full" />
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <article
              key={item.id}
              className={`group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Date Badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm text-gray-700">
                    <Calendar size={14} className="text-teal-500" />
                    {item.date}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                    {item.excerpt}
                  </p>
                  <button className="inline-flex items-center gap-2 text-teal-600 font-medium text-sm group/btn mt-auto">
                    Devamını Oku
                    <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>

                {/* Read Time Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-teal-500 text-white text-xs rounded-full">
                  <Clock size={12} />
                  5 dk
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button className="group px-8 py-4 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 inline-flex items-center gap-2">
            Tüm Haberleri Görüntüle
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
