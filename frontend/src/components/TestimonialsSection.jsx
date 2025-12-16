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
      { threshold: 0.1 }
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
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10">
          <Quote size={200} className="text-teal-500" />
        </div>
        <div className="absolute bottom-10 right-10 rotate-180">
          <Quote size={200} className="text-teal-500" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <span className="inline-block px-4 py-2 bg-teal-100 text-teal-600 rounded-full text-sm font-medium mb-4">
            Müşteri Yorumları
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            MUTLU HASTA SAHİPLERİ
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Değerli yorumlarınız bizim için çok önemli
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-teal-600 mx-auto mt-6 rounded-full" />
        </div>

        {/* Testimonials Carousel */}
        <div className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-teal-50 to-white rounded-3xl p-8 md:p-12 shadow-xl">
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white">
              <Quote size={24} />
            </div>

            {/* Content */}
            <div className="pt-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-all duration-500 ${
                    index === activeIndex 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 absolute top-0 translate-x-8'
                  }`}
                >
                  {index === activeIndex && (
                    <>
                      {/* Stars */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                        "{testimonial.comment}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                          <p className="text-teal-600 text-sm">{testimonial.pet}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`transition-all duration-300 ${
                      index === activeIndex 
                        ? 'w-8 h-2 bg-teal-500 rounded-full' 
                        : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-teal-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-teal-500 hover:text-white transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
                  className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-teal-500 hover:text-white transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
