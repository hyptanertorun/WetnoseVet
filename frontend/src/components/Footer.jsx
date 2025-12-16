import React from 'react';
import { siteInfo, corporateLinks, services, navLinks } from '../data/mockData';
import { 
  MapPin, Phone, Mail, Facebook, Twitter, Instagram, 
  Youtube, Linkedin, Heart, ChevronRight, ArrowUp 
} from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <svg viewBox="0 0 60 60" className="w-12 h-12">
                <circle cx="20" cy="15" r="8" fill="#14B8A6"/>
                <circle cx="40" cy="15" r="8" fill="#14B8A6"/>
                <circle cx="12" cy="28" r="6" fill="#14B8A6"/>
                <circle cx="48" cy="28" r="6" fill="#14B8A6"/>
                <path d="M15 35 Q20 55 30 45 Q40 55 45 35 Q40 50 30 40 Q20 50 15 35" fill="#14B8A6"/>
              </svg>
              <div>
                <span className="text-2xl font-bold">
                  <span className="text-teal-400">WET</span>
                  <span className="text-white">NOSE</span>
                </span>
                <p className="text-xs text-teal-400">Veteriner Kliniği</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Minik dostlarınızın sağlığı ve mutluluğu için 7/24 hizmetinizdeyiz. Modern klinik ve uzman kadromuzla yanınızdayız.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href={siteInfo.socialLinks.facebook} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href={siteInfo.socialLinks.twitter} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href={siteInfo.socialLinks.instagram} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href={siteInfo.socialLinks.youtube} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all duration-300">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 relative inline-block">
              Hızlı Linkler
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-teal-500" />
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    <ChevronRight size={14} className="text-teal-500 group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 relative inline-block">
              Hizmetlerimiz
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-teal-500" />
            </h4>
            <ul className="space-y-3">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <a 
                    href={`/hizmet/${service.id}`}
                    className="group flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    <ChevronRight size={14} className="text-teal-500 group-hover:translate-x-1 transition-transform" />
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 relative inline-block">
              İletişim
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-teal-500" />
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 flex-shrink-0 mt-1">
                  <MapPin size={18} />
                </div>
                <span className="text-gray-400 text-sm leading-relaxed">{siteInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 flex-shrink-0">
                  <Phone size={18} />
                </div>
                <a href={`tel:${siteInfo.phone}`} className="text-gray-400 hover:text-teal-400 transition-colors">
                  {siteInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 flex-shrink-0">
                  <Mail size={18} />
                </div>
                <a href={`mailto:${siteInfo.email}`} className="text-gray-400 hover:text-teal-400 transition-colors">
                  {siteInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm flex items-center gap-1">
              © 2024 WetNose Veteriner Kliniği - Tüm Hakları Saklıdır. 
              <Heart size={14} className="text-red-500 mx-1" /> ile yapıldı.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="/gizlilik" className="hover:text-teal-400 transition-colors">Gizlilik Politikası</a>
              <span>|</span>
              <a href="/kullanim" className="hover:text-teal-400 transition-colors">Kullanım Şartları</a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition-all duration-300 hover:shadow-teal-500/30 hover:-translate-y-1 z-50 flex items-center justify-center"
      >
        <ArrowUp size={24} />
      </button>
    </footer>
  );
};

export default Footer;
