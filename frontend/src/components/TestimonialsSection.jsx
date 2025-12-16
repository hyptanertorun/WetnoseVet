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
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      id="yorumlar" 
      ref={sectionRef}
      className="py-24 lg:py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Header */}
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-8 bg-teal-500/50" />
              <span className="text-teal-600 text-xs tracking-[0.25em] uppercase font-medium">Yorumlar</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
              Mutlu <span className="font-semibold">Hasta Sahipleri</span>
            </h2>

            <p className="text-gray-500 font-light leading-relaxed mb-10">
              Binlerce mutlu hasta sahibi ve dostları Wetnose ailesinin bir parçası.
            </p>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-teal-500 hover:text-teal-500 transition-colors"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white hover:bg-teal-700 transition-colors"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
              <span className="text-gray-400 text-sm font-light ml-2">
                {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Right - Testimonial Card */}
          <div className={`relative transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="relative bg-gray-50 rounded-2xl p-8 lg:p-10">
              {/* Quote Icon */}
              <Quote size={32} strokeWidth={1} className="text-teal-200 mb-6" />

              {/* Testimonials */}
              <div className="relative min-h-[200px]">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className={`transition-all duration-500 ${
                      index === activeIndex 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 absolute top-0 translate-y-4'
                    }`}
                  >
                    {index === activeIndex && (
                      <>
                        {/* Stars */}
                        <div className="flex gap-1 mb-6">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>

                        {/* Quote */}
                        <p className="text-lg text-gray-700 leading-relaxed mb-8 font-light italic">
                          "{testimonial.comment}"
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-lg font-medium">
                            {testimonial.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800">{testimonial.name}</h4>
                            <p className="text-teal-600 text-xs">{testimonial.pet}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
