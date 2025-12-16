import React from 'react';
import { siteInfo, services, navLinks } from '../data/mockData';
import { MapPin, Phone, Mail, Facebook, Instagram, ArrowUp, Heart } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_furry-makeover-2/artifacts/45ik1y82_logo_anasayfa.png";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <img src={LOGO_URL} alt="Wetnose" className="h-12 mb-6" />
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
              Minik dostlarınızın sağlığı ve mutluluğu için 7/24 hizmetinizdeyiz.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-600 hover:text-white transition-colors">
                <Facebook size={16} strokeWidth={1.5} />
              </a>
              <a href={siteInfo.socialLinks.instagram} className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:bg-teal-600 hover:text-white transition-colors">
                <Instagram size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-6">Hızlı Linkler</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 text-sm font-light hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold mb-6">Hizmetler</h4>
            <ul className="space-y-3">
              {services.slice(0, 5).map((service) => (
                <li key={service.id}>
                  <a href="#" className="text-gray-400 text-sm font-light hover:text-white transition-colors">
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-6">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} strokeWidth={1.5} className="text-teal-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm font-light">{siteInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} strokeWidth={1.5} className="text-teal-500" />
                <a href={`tel:${siteInfo.phone}`} className="text-gray-400 text-sm font-light hover:text-white transition-colors">
                  {siteInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} strokeWidth={1.5} className="text-teal-500" />
                <a href={`mailto:${siteInfo.email}`} className="text-gray-400 text-sm font-light hover:text-white transition-colors">
                  {siteInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs font-light flex items-center gap-1">
              © 2024 WetNose Veteriner • Tüm Hakları Saklıdır
              <Heart size={10} className="text-red-500 mx-1" />
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-teal-700 transition-all duration-300 hover:-translate-y-1 z-50"
      >
        <ArrowUp size={18} strokeWidth={1.5} />
      </button>
    </footer>
  );
};

export default Footer;
