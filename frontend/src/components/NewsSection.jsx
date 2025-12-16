import React, { useEffect, useRef, useState } from 'react';
import { news } from '../data/mockData';
import { Calendar, ArrowRight } from 'lucide-react';

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
      className="py-24 lg:py-32 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-end md:justify-between mb-12 lg:mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-teal-500/50" />
              <span className="text-teal-600 text-xs tracking-[0.25em] uppercase font-medium">Blog</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-800">
              Haberler & <span className="font-semibold">Makaleler</span>
            </h2>
          </div>

          <button className="hidden md:inline-flex items-center gap-2 text-teal-600 text-sm font-medium mt-6 md:mt-0 hover:gap-3 transition-all">
            Tüm Yazılar
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {news.map((item, index) => (
            <article
              key={item.id}
              className={`group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-500">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-gray-600 flex items-center gap-1.5">
                    <Calendar size={12} strokeWidth={1.5} className="text-teal-500" />
                    {item.date}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs font-light line-clamp-2 mb-4">
                    {item.excerpt}
                  </p>
                  <button className="inline-flex items-center gap-1.5 text-teal-600 text-xs font-medium">
                    Devamını Oku
                    <ArrowRight size={12} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
