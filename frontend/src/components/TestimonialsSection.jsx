import React, { useEffect, useRef, useState } from 'react';
import { testimonials } from '../data/mockData';
import { Star, Quote, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState('next');

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

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection('next');
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToPrev = () => {
    setDirection('prev');
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection('next');
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section 
      id="yorumlar" 
      ref={sectionRef}
      className="py-28 bg-white relative overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-50 rounded-full translate-x-1/2 translate-y-1/2 opacity-50" />
        {/* Quote Icons */}
        <Quote className="absolute top-20 left-[10%] text-teal-100 w-32 h-32 rotate-180" />
        <Quote className="absolute bottom-20 right-[10%] text-teal-100 w-24 h-24" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-600 rounded-full text-sm font-medium mb-6 shadow-sm">
            <MessageCircle size={16} />
            Müşteri Yorumları
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            MUTLU HASTA SAHİPLERİ
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Değerli yorumlarınız bizim için çok önemli
          </p>
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className="w-2 h-2 bg-teal-300 rounded-full" />
            <span className="w-20 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            <span className="w-2 h-2 bg-teal-300 rounded-full" />
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className={`relative max-w-5xl mx-auto transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-teal-50 via-white to-gray-50 rounded-[2.5rem] p-10 md:p-16 shadow-2xl">
            {/* Large Quote Icon */}
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <Quote size={32} />
            </div>

            {/* Testimonials */}
            <div className="relative min-h-[280px] overflow-hidden">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    index === activeIndex 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : direction === 'next'
                        ? 'opacity-0 translate-x-full scale-95'
                        : 'opacity-0 -translate-x-full scale-95'
                  }`}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-8 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={28} 
                        className="fill-yellow-400 text-yellow-400 drop-shadow-sm" 
                        style={{ 
                          animation: index === activeIndex ? `scale-in 0.3s ease-out ${i * 0.1}s forwards` : 'none',
                          opacity: index === activeIndex ? 1 : 0
                        }}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed text-center mb-10 italic font-light">
                    "{testimonial.comment}"
                  </p>

                  {/* Author */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl mb-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <h4 className="text-xl font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-teal-600 font-medium">{testimonial.pet}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-200">
              {/* Dots */}
              <div className="flex gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > activeIndex ? 'next' : 'prev');
                      setActiveIndex(index);
                    }}
                    className="relative group"
                  >
                    <span className={`block transition-all duration-500 rounded-full ${
                      index === activeIndex 
                        ? 'w-10 h-3 bg-gradient-to-r from-teal-400 to-teal-600' 
                        : 'w-3 h-3 bg-gray-300 hover:bg-teal-300'
                    }`} />
                  </button>
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-3">
                <button
                  onClick={goToPrev}
                  className="group w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-teal-500 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={goToNext}
                  className="group w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-teal-500 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Decorative Cards Behind */}
          <div className="absolute -top-4 -left-4 w-full h-full bg-teal-100 rounded-[2.5rem] -z-10 rotate-2" />
          <div className="absolute -top-2 -left-2 w-full h-full bg-teal-50 rounded-[2.5rem] -z-20 rotate-1" />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
