import React, { useEffect, useRef, useState } from 'react';
import { news } from '../data/mockData';
import { Calendar, ArrowRight, Clock, BookOpen, Sparkles } from 'lucide-react';

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
      className="py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
    >
      {/* Decorative Shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-100 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 opacity-60 blur-3xl" />
      
      {/* Floating Decorations */}
      <div className="absolute top-32 left-[10%] w-4 h-4 bg-teal-400 rounded-full animate-float opacity-30" />
      <div className="absolute bottom-40 right-[15%] w-3 h-3 bg-teal-300 rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-600 rounded-full text-sm font-medium mb-6 shadow-sm">
            <BookOpen size={16} />
            Blog & Haberler
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            BİZDEN HABERLER
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Veteriner sağlığı hakkında en güncel bilgiler
          </p>
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-2 h-2 bg-teal-300 rounded-full" />
            <span className="w-20 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            <span className="w-2 h-2 bg-teal-300 rounded-full" />
          </div>
        </div>

        {/* News Grid - Featured + Regular */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News (First Item) */}
          <article
            className={`group row-span-2 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
            onMouseEnter={() => setHoveredNews(news[0].id)}
            onMouseLeave={() => setHoveredNews(null)}
          >
            <div className="relative h-full bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              {/* Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={news[0].image}
                  alt={news[0].title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Featured Badge */}
                <div className="absolute top-6 left-6 px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-full flex items-center gap-2">
                  <Sparkles size={14} />
                  Öne Çıkan
                </div>

                {/* Date */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm text-gray-700">
                    <Calendar size={14} className="text-teal-500" />
                    {news[0].date}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm text-gray-700">
                    <Clock size={14} className="text-teal-500" />
                    5 dk okuma
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-teal-600 transition-colors">
                  {news[0].title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {news[0].excerpt}
                </p>
                <button className="group/btn inline-flex items-center gap-2 text-teal-600 font-semibold transition-all duration-300">
                  Devamını Oku
                  <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          </article>

          {/* Other News */}
          <div className="space-y-8">
            {news.slice(1).map((item, index) => (
              <article
                key={item.id}
                className={`group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
                style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                onMouseEnter={() => setHoveredNews(item.id)}
                onMouseLeave={() => setHoveredNews(null)}
              >
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex">
                  {/* Image */}
                  <div className="relative w-40 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar size={14} className="text-teal-500" />
                      {item.date}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <button className="inline-flex items-center gap-1 text-teal-600 font-medium text-sm mt-auto group/btn">
                      Oku
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Side Accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-teal-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button className="group px-10 py-5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-semibold text-lg overflow-hidden shadow-xl shadow-teal-500/25 hover:shadow-2xl hover:shadow-teal-500/40 transition-all duration-500 hover:-translate-y-1 relative">
            <span className="relative z-10 flex items-center gap-3">
              Tüm Haberleri Görüntüle
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
