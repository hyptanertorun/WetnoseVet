import React, { useEffect, useRef, useState } from 'react';
import { Heart, Users, Award, Clock } from 'lucide-react';

const stats = [
  { icon: Heart, value: 15000, suffix: '+', label: 'Mutlu Hasta' },
  { icon: Users, value: 10, suffix: '+', label: 'Uzman Hekim' },
  { icon: Award, value: 8, suffix: '', label: 'Yıllık Deneyim' },
  { icon: Clock, value: 24, suffix: '/7', label: 'Acil Hizmet' }
];

const AnimatedCounter = ({ value, suffix, isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return <span className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
};

const StatsSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-teal-600">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <stat.icon size={24} strokeWidth={1.5} className="mx-auto text-teal-200 mb-4" />
              <div className="text-4xl lg:text-5xl font-light text-white mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
              </div>
              <p className="text-teal-100 text-sm font-light tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
