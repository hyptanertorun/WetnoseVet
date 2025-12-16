import React, { useState } from 'react';
import { siteInfo, services, navLinks } from '../data/mockData';
import { 
  MapPin, Phone, Mail, Facebook, Twitter, Instagram, 
  Youtube, Heart, ArrowUp, Send, ArrowRight 
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
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Newsletter Banner */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-500">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-2">Bültenimize Abone Olun</h3>
              <p className="text-teal-100 text-lg">Veteriner sağlığı hakkında güncel bilgiler için</p>
            </div>
            
            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-3">
              {subscribed ? (
                <div className="flex items-center gap-3 px-8 py-4 bg-white/20 rounded-full">
                  <Heart className="text-white fill-white" size={20} />
                  <span className="font-medium">Başarıyla abone oldunuz!</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="flex-1 lg:w-80 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
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

      {/* Main Footer */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <img src={LOGO_URL} alt="Wetnose" className="h-16 mb-6" />
              <p className="text-white/60 leading-relaxed mb-8">
                Minik dostlarınızın sağlığı ve mutluluğu için modern veteriner hizmetleri.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-white/60 hover:bg-teal-500 hover:text-white transition-all duration-300"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 relative">
                Hızlı Linkler
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-teal-500" />
              </h4>
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                      <ArrowRight size={14} className="text-teal-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold mb-6 relative">
                Hizmetler
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-teal-500" />
              </h4>
              <ul className="space-y-4">
                {services.slice(0, 6).map((service) => (
                  <li key={service.id}>
                    <a 
                      href={`#`}
                      className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                      <ArrowRight size={14} className="text-teal-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-6 relative">
                İletişim
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-teal-500" />
              </h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 flex-shrink-0 mt-1">
                    <MapPin size={18} />
                  </div>
                  <span className="text-white/60 text-sm leading-relaxed">{siteInfo.address}</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">
                    <Phone size={18} />
                  </div>
                  <a href={`tel:${siteInfo.phone}`} className="text-white/60 hover:text-white transition-colors">
                    {siteInfo.phone}
                  </a>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-400">
                    <Mail size={18} />
                  </div>
                  <a href={`mailto:${siteInfo.email}`} className="text-white/60 hover:text-white transition-colors">
                    {siteInfo.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/40 text-sm flex items-center gap-2">
                © 2024 WetNose Veteriner Kliniği
                <span className="text-white/20">|</span>
                <Heart size={14} className="text-red-500" /> ile yapıldı
              </p>
              <div className="flex items-center gap-6 text-sm text-white/40">
                <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
                <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-teal-600 transition-all duration-300 hover:-translate-y-1 z-50 group"
      >
        <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  );
};

export default Footer;
