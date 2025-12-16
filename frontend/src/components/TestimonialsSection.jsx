import React, { useEffect, useRef, useState } from 'react';
import { testimonials } from '../data/mockData';
import { Star, Quote, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

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
      className="py-24 lg:py-32 relative overflow-hidden bg-gray-50"
    >
      {/* Background */}
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Gradient Blobs */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      
      {/* Large Quote */}
      <Quote className="absolute top-1/4 left-[5%] w-48 h-48 text-teal-500/5" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Header */}
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle size={16} className="text-teal-500" />
              <span className="text-teal-600 text-xs tracking-[0.3em] uppercase font-medium">Yorumlar</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-800 mb-6">
              Mutlu <span className="font-semibold gradient-text">Hasta Sahipleri</span>
            </h2>

            <p className="text-gray-500 font-light leading-relaxed mb-10">
              Binlerce mutlu hasta sahibi ve dostları Wetnose ailesinin bir parçası.
            </p>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:border-teal-500 hover:text-teal-500 transition-all hover:shadow-lg hover:shadow-teal-500/10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all"
              >
                <ChevronRight size={18} />
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
            {/* Glassmorphism Card */}
            <div className="relative glass rounded-3xl p-8 lg:p-10 border border-white/50 shadow-xl">
              {/* Quote Icon with Glow */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30">
                <Quote size={20} className="text-white" />
              </div>

              {/* Testimonials */}
              <div className="relative min-h-[220px]">
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
                            <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>

                        {/* Quote */}
                        <p className="text-lg text-gray-700 leading-relaxed mb-8 font-light italic">
                          "{testimonial.comment}"
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-lg font-semibold">
                              {testimonial.name.charAt(0)}
                            </div>
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

              {/* Progress Dots */}
              <div className="absolute bottom-8 right-8 flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === activeIndex 
                        ? 'w-6 h-2 bg-gradient-to-r from-teal-500 to-cyan-500' 
                        : 'w-2 h-2 bg-gray-300 hover:bg-teal-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
