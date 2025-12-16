import React, { useEffect, useRef, useState } from 'react';
import { Heart, Users, Award, Clock, Activity } from 'lucide-react';

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

  return <span className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
};

// Animated Wave Component
const WaveLine = () => (
  <svg className="w-full h-6" viewBox="0 0 100 20">
    <path
      d="M0,10 Q5,10 10,10 T20,5 T30,15 T40,10 T50,10 T60,5 T70,15 T80,10 T90,10 T100,10"
      fill="none"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="2"
      className="animate-pulse"
    />
  </svg>
);

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
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500" />
      
      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Animated Blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-morph" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-morph" style={{ animationDelay: '3s' }} />

      {/* Wave Lines */}
      <div className="absolute top-8 left-0 right-0 opacity-30">
        <WaveLine />
      </div>
      <div className="absolute bottom-8 left-0 right-0 opacity-30">
        <WaveLine />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <Activity size={16} className="text-white animate-pulse" />
            <span className="text-white/90 text-xs tracking-wider uppercase">Canlı İstatistikler</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Glassmorphism Card */}
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10">
                {/* Icon with Gradient */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <stat.icon size={22} className="text-white" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Value */}
                <div className="text-4xl lg:text-5xl font-light text-white mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                </div>

                {/* Label */}
                <p className="text-white/70 text-sm font-light tracking-wide">
                  {stat.label}
                </p>

                {/* Decorative Line */}
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
