import React, { useState, useEffect } from 'react';
import { navLinks, siteInfo } from '../data/mockData';
import { Menu, X, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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
      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-10 opacity-100'
      }`}>
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 h-full">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-6">
              <a href={`tel:${siteInfo.phone}`} className="flex items-center gap-2 hover:text-teal-100 transition-colors">
                <Phone size={14} />
                <span>{siteInfo.phone}</span>
              </a>
              <a href={`mailto:${siteInfo.email}`} className="hidden sm:flex items-center gap-2 hover:text-teal-100 transition-colors">
                <Mail size={14} />
                <span>{siteInfo.email}</span>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a href={siteInfo.socialLinks.facebook} className="hover:text-teal-200 transition-transform hover:scale-110"><Facebook size={16} /></a>
              <a href={siteInfo.socialLinks.twitter} className="hover:text-teal-200 transition-transform hover:scale-110"><Twitter size={16} /></a>
              <a href={siteInfo.socialLinks.instagram} className="hover:text-teal-200 transition-transform hover:scale-110"><Instagram size={16} /></a>
              <a href={siteInfo.socialLinks.youtube} className="hover:text-teal-200 transition-transform hover:scale-110"><Youtube size={16} /></a>
              <a href={siteInfo.socialLinks.linkedin} className="hover:text-teal-200 transition-transform hover:scale-110"><Linkedin size={16} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'top-0 bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'top-10 bg-white/80 backdrop-blur-md'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); scrollToSection('/'); }}
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <svg viewBox="0 0 60 60" className="w-12 h-12 transition-transform duration-500 group-hover:scale-110">
                  {/* Paw-shaped W Logo */}
                  <circle cx="20" cy="15" r="8" fill="#00A99D" className="transition-all duration-300 group-hover:fill-teal-400"/>
                  <circle cx="40" cy="15" r="8" fill="#00A99D" className="transition-all duration-300 group-hover:fill-teal-400"/>
                  <circle cx="12" cy="28" r="6" fill="#00A99D" className="transition-all duration-300 group-hover:fill-teal-400"/>
                  <circle cx="48" cy="28" r="6" fill="#00A99D" className="transition-all duration-300 group-hover:fill-teal-400"/>
                  <path d="M15 35 Q20 55 30 45 Q40 55 45 35 Q40 50 30 40 Q20 50 15 35" fill="#00A99D" className="transition-all duration-300 group-hover:fill-teal-400"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  <span className="text-teal-500">WET</span>
                  <span className="text-gray-700">NOSE</span>
                </span>
                <span className="text-xs text-teal-500 tracking-wider">Veteriner Kliniği</span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                    activeSection === link.href ? 'text-teal-500' : 'text-gray-700 hover:text-teal-500'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-teal-500 transition-all duration-300 ${
                    activeSection === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <button 
                onClick={() => scrollToSection('/iletisim')}
                className="px-6 py-2.5 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
              >
                Randevu Al
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-teal-500 transition-colors"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className="block px-4 py-3 text-gray-700 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
            <button className="w-full mt-4 px-6 py-3 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition-all">
              Randevu Al
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
