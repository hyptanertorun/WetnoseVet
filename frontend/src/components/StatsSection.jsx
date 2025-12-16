import React, { useEffect, useRef, useState } from 'react';
import { Heart, Users, Award, Clock } from 'lucide-react';

const stats = [
  { icon: Heart, value: 15000, suffix: '+', label: 'Mutlu Hasta', color: 'from-rose-500 to-pink-500' },
  { icon: Users, value: 10, suffix: '+', label: 'Uzman Hekim', color: 'from-teal-500 to-cyan-500' },
  { icon: Award, value: 8, suffix: '', label: 'Yıllık Deneyim', color: 'from-amber-500 to-orange-500' },
  { icon: Clock, value: 24, suffix: '/7', label: 'Acil Hizmet', color: 'from-violet-500 to-purple-500' }
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

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
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
    <section 
      ref={sectionRef}
      className="relative py-32 bg-gray-900 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Icon */}
              <div className={`mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.color} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center">
                  <stat.icon size={32} className="text-white" />
                </div>
              </div>

              {/* Value */}
              <div className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
              </div>

              {/* Label */}
              <p className="text-white/60 text-lg font-medium">
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
