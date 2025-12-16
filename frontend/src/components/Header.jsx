import React, { useState, useEffect } from 'react';
import { navLinks, siteInfo } from '../data/mockData';
import { Menu, X, Phone, Mail } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_furry-makeover-2/artifacts/45ik1y82_logo_anasayfa.png";

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
      {/* Top Bar - Elegant thin line */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-9 opacity-100'
      }`}>
        <div className="bg-teal-600/95 backdrop-blur-sm h-full">
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between text-white/90 text-xs tracking-wide">
            <div className="flex items-center gap-8">
              <a href={`tel:${siteInfo.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={12} strokeWidth={1.5} />
                <span className="font-light">{siteInfo.phone}</span>
              </a>
              <a href={`mailto:${siteInfo.email}`} className="hidden sm:flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={12} strokeWidth={1.5} />
                <span className="font-light">{siteInfo.email}</span>
              </a>
            </div>
            <span className="font-light">7/24 Acil Hizmet</span>
          </div>
        </div>
      </div>

      {/* Main Navigation - Clean & Minimal */}
      <header className={`fixed left-0 right-0 z-40 transition-all duration-700 ${
        isScrolled 
          ? 'top-0 bg-white/98 backdrop-blur-md shadow-sm' 
          : 'top-9 bg-white/95 backdrop-blur-sm'
      }`}>
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a 
              href="/" 
              onClick={(e) => { e.preventDefault(); scrollToSection('/'); }}
              className="flex items-center"
            >
              <img 
                src={LOGO_URL} 
                alt="Wetnose Veteriner" 
                className={`transition-all duration-500 ${
                  isScrolled ? 'h-10' : 'h-11'
                }`}
              />
            </a>

            {/* Desktop Navigation - Refined */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className={`px-4 py-2 text-[13px] font-medium tracking-wide transition-colors ${
                    activeSection === link.href 
                      ? 'text-teal-600' 
                      : 'text-gray-600 hover:text-teal-600'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* CTA Button - Elegant */}
            <div className="hidden lg:block">
              <button 
                onClick={() => scrollToSection('/iletisim')}
                className="px-5 py-2 bg-teal-600 text-white text-[13px] font-medium tracking-wide rounded-full hover:bg-teal-700 transition-all duration-300"
              >
                Randevu Al
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu - Clean */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-500 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className="block px-4 py-3 text-gray-600 hover:text-teal-600 text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
