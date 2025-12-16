import React, { useState, useEffect } from 'react';
import { navLinks, siteInfo } from '../data/mockData';
import { Menu, X, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

// Original logo URL
const LOGO_URL = "https://customer-assets.emergentagent.com/job_furry-makeover-2/artifacts/45ik1y82_logo_anasayfa.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('/');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href) => {
    const sectionId = href === '/' ? 'hero' : href.replace('/', '');
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-gray-200/20">
        <div 
          className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
        {/* Paw Print Progress Indicator */}
        <div 
          className="absolute top-0 h-6 w-6 -translate-y-1/2 transition-all duration-150"
          style={{ left: `calc(${scrollProgress}% - 12px)` }}
        >
          <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-lg">
            <circle cx="20" cy="15" r="8" fill="#14B8A6"/>
            <circle cx="40" cy="15" r="8" fill="#14B8A6"/>
            <circle cx="12" cy="28" r="6" fill="#14B8A6"/>
            <circle cx="48" cy="28" r="6" fill="#14B8A6"/>
            <path d="M15 35 Q20 55 30 45 Q40 55 45 35 Q40 50 30 40 Q20 50 15 35" fill="#14B8A6"/>
          </svg>
        </div>
      </div>

      {/* Top Bar */}
      <div className={`fixed top-1 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-10 opacity-100'
      }`}>
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 h-full">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-6">
              <a href={`tel:${siteInfo.phone}`} className="flex items-center gap-2 hover:text-teal-100 transition-colors group">
                <Phone size={14} className="group-hover:animate-bounce" />
                <span>{siteInfo.phone}</span>
              </a>
              <a href={`mailto:${siteInfo.email}`} className="hidden sm:flex items-center gap-2 hover:text-teal-100 transition-colors">
                <Mail size={14} />
                <span>{siteInfo.email}</span>
              </a>
            </div>
            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="hover:text-teal-200 transition-all hover:scale-125 hover:-translate-y-0.5"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className={`fixed left-0 right-0 z-40 transition-all duration-700 ${
        isScrolled 
          ? 'top-1 bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/5' 
          : 'top-12 bg-white/80 backdrop-blur-md'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); scrollToSection('/'); }}
              className="flex items-center gap-2 group"
            >
              <img 
                src={LOGO_URL} 
                alt="Wetnose Veteriner" 
                className={`transition-all duration-500 group-hover:scale-105 ${
                  isScrolled ? 'h-12' : 'h-14'
                }`}
              />
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group overflow-hidden ${
                    activeSection === link.href ? 'text-teal-500' : 'text-gray-700 hover:text-teal-500'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="relative z-10">{link.name}</span>
                  {/* Hover background */}
                  <span className="absolute inset-0 bg-teal-50 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg" />
                  {/* Active indicator */}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300 ${
                    activeSection === link.href ? 'w-full' : 'w-0 group-hover:w-3/4'
                  }`} />
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <button 
                onClick={() => scrollToSection('/iletisim')}
                className="relative px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-medium overflow-hidden group"
              >
                <span className="relative z-10">Randevu Al</span>
                <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-teal-500 transition-colors"
            >
              <div className="relative w-7 h-7">
                <Menu className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`} size={28} />
                <X className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}`} size={28} />
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-6 space-y-1">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className="block px-4 py-3 text-gray-700 hover:text-teal-500 hover:bg-teal-50 rounded-xl transition-all duration-300"
                style={{ 
                  transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transitionDelay: `${i * 50}ms`
                }}
              >
                {link.name}
              </a>
            ))}
            <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full font-medium hover:from-teal-600 hover:to-teal-700 transition-all">
              Randevu Al
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
