import React, { useEffect, useRef, useState } from 'react';
import { news } from '../data/mockData';
import { Calendar, ArrowRight, Clock, TrendingUp } from 'lucide-react';

const NewsSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredNews, setHoveredNews] = useState(null);

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
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
      <div className="absolute inset-0 dot-pattern opacity-30" />
      
      {/* Gradient Blob */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-end md:justify-between mb-12 lg:mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={16} className="text-teal-500" />
              <span className="text-teal-600 text-xs tracking-[0.3em] uppercase font-medium">Blog</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800">
              Haberler & <span className="font-semibold gradient-text">Makaleler</span>
            </h2>
          </div>

          <button className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 text-sm font-medium mt-6 md:mt-0 hover:border-teal-500 hover:text-teal-600 transition-all hover:shadow-lg hover:shadow-teal-500/10">
            Tüm Yazılar
            <ArrowRight size={16} />
          </button>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => {
            const isHovered = hoveredNews === item.id;
            
            return (
              <article
                key={item.id}
                className={`group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredNews(item.id)}
                onMouseLeave={() => setHoveredNews(null)}
              >
                <div className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-500 ${
                  isHovered ? 'shadow-2xl shadow-teal-500/15 -translate-y-2' : 'shadow-lg shadow-gray-200/50'
                }`}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 glass rounded-full px-3 py-1.5 flex items-center gap-2">
                      <Calendar size={12} className="text-teal-500" />
                      <span className="text-gray-700 text-xs">{item.date}</span>
                    </div>

                    {/* Read Time */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                      <Clock size={12} className="text-white" />
                      <span className="text-white text-xs font-medium">5 dk</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className={`text-sm font-semibold mb-2 line-clamp-2 transition-colors duration-300 ${
                      isHovered ? 'text-teal-600' : 'text-gray-800'
                    }`}>
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs font-light line-clamp-2 mb-4">
                      {item.excerpt}
                    </p>
                    <button className={`inline-flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
                      isHovered ? 'gap-3 text-teal-500' : 'text-teal-600'
                    }`}>
                      Devamını Oku
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Bottom Glow Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform transition-transform duration-300 origin-left ${
                    isHovered ? 'scale-x-100' : 'scale-x-0'
                  }`} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
