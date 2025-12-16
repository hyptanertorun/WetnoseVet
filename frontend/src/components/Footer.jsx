import React, { useState } from 'react';
import { siteInfo, services, navLinks } from '../data/mockData';
import { 
  MapPin, Phone, Mail, Facebook, Twitter, Instagram, 
  Youtube, Heart, ChevronRight, ArrowUp, Send, Sparkles 
} from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_furry-makeover-2/artifacts/45ik1y82_logo_anasayfa.png";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Wave SVG Top */}
      <div className="absolute top-0 left-0 right-0 -translate-y-[99%]">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-gray-900">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
      </div>

      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />

      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Sparkles className="text-teal-200" size={20} />
                <span className="text-teal-100 font-medium">Bülten</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Haberlerden Haberdar Olun</h3>
              <p className="text-teal-100">En güncel veteriner bilgileri için abone olun</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-3">
              {subscribed ? (
                <div className="flex items-center gap-2 px-6 py-4 bg-white/20 rounded-full text-white">
                  <Sparkles size={20} />
                  <span>Başarıyla abone oldunuz!</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="flex-1 md:w-72 px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Send size={18} />
                    <span className="hidden sm:inline">Abone Ol</span>
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={LOGO_URL} alt="Wetnose" className="h-14" />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Minik dostlarınızın sağlığı ve mutluluğu için 7/24 hizmetinizdeyiz. Modern klinik ve uzman kadromuzla yanınızdayız.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="group w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 relative inline-block">
              Hızlı Linkler
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-all duration-300"
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
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            </h4>
            <ul className="space-y-3">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <a 
                    href={`/hizmet/${service.id}`}
                    className="group flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-all duration-300"
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
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-11 h-11 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 flex-shrink-0 mt-0.5 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                  <MapPin size={18} />
                </div>
                <span className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">{siteInfo.address}</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-11 h-11 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 flex-shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                  <Phone size={18} />
                </div>
                <a href={`tel:${siteInfo.phone}`} className="text-gray-400 hover:text-teal-400 transition-colors">
                  {siteInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-11 h-11 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 flex-shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
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
              <Heart size={14} className="text-red-500 mx-1 animate-pulse" /> ile yapıldı.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="/gizlilik" className="hover:text-teal-400 transition-colors">Gizlilik Politikası</a>
              <span className="text-gray-700">|</span>
              <a href="/kullanim" className="hover:text-teal-400 transition-colors">Kullanım Şartları</a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-2 z-50 flex items-center justify-center group"
      >
        <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  );
};

export default Footer;
