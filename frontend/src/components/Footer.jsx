import React, { useState } from 'react';
import { siteInfo, services, navLinks } from '../data/mockData';
import { MapPin, Phone, Mail, Facebook, Instagram, ArrowUp, Heart, Send, Sparkles } from 'lucide-react';

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
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Newsletter Section */}
      <div className="relative bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Bültenimize Abone Olun</h3>
                <p className="text-teal-100 text-sm font-light">Güncel veteriner bilgileri için</p>
              </div>
            </div>
            
            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-3">
              {subscribed ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Heart className="text-white fill-white animate-heartbeat" size={18} />
                  <span className="font-medium text-sm">Abone oldunuz!</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="flex-1 lg:w-72 px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-white text-teal-600 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-white/20 transition-all flex items-center gap-2"
                  >
                    <Send size={16} />
                    <span className="hidden sm:inline">Abone Ol</span>
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative">
        {/* Subtle gradient */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <img src={LOGO_URL} alt="Wetnose" className="h-12 mb-6" />
              <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
                Minik dostlarınızın sağlığı için modern veteriner hizmetleri.
              </p>
              <div className="flex gap-3">
                {[Facebook, Instagram].map((Icon, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:text-white transition-all duration-300"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold mb-6 relative inline-block">
                Hızlı Linkler
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 text-sm font-light hover:text-teal-400 transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold mb-6 relative inline-block">
                Hizmetler
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
              </h4>
              <ul className="space-y-3">
                {services.slice(0, 5).map((service) => (
                  <li key={service.id}>
                    <a href="#" className="text-gray-400 text-sm font-light hover:text-teal-400 transition-colors">
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold mb-6 relative inline-block">
                İletişim
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm font-light">{siteInfo.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-teal-500" />
                  <a href={`tel:${siteInfo.phone}`} className="text-gray-400 text-sm font-light hover:text-teal-400 transition-colors">
                    {siteInfo.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-teal-500" />
                  <a href={`mailto:${siteInfo.email}`} className="text-gray-400 text-sm font-light hover:text-teal-400 transition-colors">
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
                <a href="#" className="hover:text-teal-400 transition-colors">Gizlilik</a>
                <a href="#" className="hover:text-teal-400 transition-colors">Kullanım Şartları</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top with Glow */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300 hover:-translate-y-1 z-50"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;
