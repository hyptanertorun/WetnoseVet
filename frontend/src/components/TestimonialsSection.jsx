import React, { useEffect, useRef, useState } from 'react';
import { testimonials } from '../data/mockData';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      id="yorumlar" 
      ref={sectionRef}
      className="relative min-h-screen bg-gray-50 overflow-hidden flex items-center"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Large Quote */}
      <Quote className="absolute top-20 left-[10%] w-64 h-64 text-teal-100 -rotate-12" />

      <div className="relative w-full max-w-7xl mx-auto px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Header */}
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-20 bg-teal-500" />
              <span className="text-teal-600 text-sm tracking-[0.3em] uppercase font-medium">Yorumlar</span>
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-none mb-8">
              MUTLU
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
                DOSTLAR
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Binlerce mutlu hasta sahibi ve dostları Wetnose ailesinin bir parçası.
            </p>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-12">
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-teal-500 hover:text-teal-500 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
                className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white hover:bg-teal-600 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <span className="ml-4 text-gray-400 font-mono">
                {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Right - Testimonial Cards */}
          <div className={`relative h-[500px] transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex;
              const isPrev = index === (activeIndex - 1 + testimonials.length) % testimonials.length;
              const isNext = index === (activeIndex + 1) % testimonials.length;

              return (
                <div
                  key={testimonial.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    isActive ? 'opacity-100 z-10 translate-x-0 scale-100' :
                    isPrev ? 'opacity-40 z-0 -translate-x-20 scale-95' :
                    isNext ? 'opacity-40 z-0 translate-x-20 scale-95' :
                    'opacity-0 z-0 translate-y-10'
                  }`}
                >
                  <div className="h-full bg-white rounded-3xl shadow-2xl p-10 flex flex-col justify-center">
                    {/* Stars */}
                    <div className="flex gap-1 mb-8">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={28} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-10 italic font-light">
                      "{testimonial.comment}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-teal-600">{testimonial.pet}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
