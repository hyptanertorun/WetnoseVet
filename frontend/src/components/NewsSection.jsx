import React, { useEffect, useRef, useState } from 'react';
import { news } from '../data/mockData';
import { Calendar, ArrowRight, ArrowUpRight } from 'lucide-react';

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
      className="relative py-32 bg-white overflow-hidden"
    >
      {/* Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className={`flex items-end justify-between mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-20 bg-teal-500" />
              <span className="text-teal-600 text-sm tracking-[0.3em] uppercase font-medium">Blog</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-none">
              HABERLER &
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
                MAKALELER
              </span>
            </h2>
          </div>

          <button className="hidden md:flex items-center gap-3 px-8 py-4 border-2 border-gray-900 rounded-full font-semibold hover:bg-gray-900 hover:text-white transition-colors group">
            Tüm Yazılar
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* News Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured - Large */}
          <div 
            className={`lg:col-span-2 lg:row-span-2 group cursor-pointer transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            data-cursor="Oku"
          >
            <div className="relative h-full min-h-[500px] rounded-3xl overflow-hidden">
              <img
                src={news[0].image}
                alt={news[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={16} className="text-teal-400" />
                  <span className="text-white/70 text-sm">{news[0].date}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {news[0].title}
                </h3>
                <p className="text-white/70 text-lg mb-6 max-w-xl">
                  {news[0].excerpt}
                </p>
                <div className="flex items-center gap-2 text-teal-400 font-medium group-hover:gap-4 transition-all">
                  <span>Devamını Oku</span>
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Other News */}
          {news.slice(1).map((item, index) => (
            <div
              key={item.id}
              data-cursor="Oku"
              className={`group cursor-pointer transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="relative h-[280px] rounded-3xl overflow-hidden mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
                  <Calendar size={14} className="text-teal-500" />
                  {item.date}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-teal-600 font-medium text-sm">
                <span>Oku</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
