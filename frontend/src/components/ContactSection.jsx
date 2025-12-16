import React, { useEffect, useRef, useState } from 'react';
import { siteInfo } from '../data/mockData';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Sparkles } from 'lucide-react';

const ContactSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    { icon: MapPin, label: 'Adres', value: siteInfo.address, color: 'from-rose-500 to-pink-500' },
    { icon: Phone, label: 'Telefon', value: siteInfo.phone, color: 'from-teal-500 to-cyan-500' },
    { icon: Mail, label: 'E-Posta', value: siteInfo.email, color: 'from-violet-500 to-purple-500' },
    { icon: Clock, label: 'Çalışma', value: '7/24 Açık', color: 'from-amber-500 to-orange-500' }
  ];

  return (
    <section 
      id="iletisim" 
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      
      {/* Dot Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles size={16} className="text-teal-400" />
            <span className="text-teal-400 text-xs tracking-[0.3em] uppercase font-medium">İletişim</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">
            Bize <span className="font-semibold gradient-text">Ulaşın</span>
          </h2>
          
          <p className="text-gray-400 max-w-xl mx-auto font-light">
            Sorularınız veya randevu talepleriniz için bize ulaşın
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info Cards */}
          <div className={`lg:col-span-2 space-y-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            {contactInfo.map((info, index) => (
              <div 
                key={info.label}
                className="group glass-dark rounded-2xl p-5 border border-white/10 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-r ${info.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center">
                      <info.icon size={18} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">{info.label}</div>
                    <div className="text-white text-sm font-medium">{info.value}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Map */}
            <div className="h-48 rounded-2xl overflow-hidden border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3019.5!2d29.9!3d40.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzAwLjAiTiAyOcKwNTQnMDAuMCJF!5e0!3m2!1str!2str!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) invert(1) opacity(0.7)' }}
                allowFullScreen=""
                loading="lazy"
                title="Wetnose Konum"
              />
            </div>
          </div>

          {/* Form - Glassmorphism */}
          <div className={`lg:col-span-3 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="glass-dark rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Online Randevu</h3>
              <p className="text-gray-400 text-sm font-light mb-8">Formu doldurun, sizinle iletişime geçelim</p>

              {isSubmitted ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Mesaj Gönderildi!</h4>
                  <p className="text-gray-400 text-sm font-light">En kısa sürede dönüş yapacağız.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white text-sm focus:outline-none transition-all ${
                          focusedField === 'name' ? 'border-teal-500 bg-white/10' : 'border-white/10'
                        }`}
                        placeholder="Adınız Soyadınız"
                        required
                      />
                    </div>
                    {/* Phone */}
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white text-sm focus:outline-none transition-all ${
                          focusedField === 'phone' ? 'border-teal-500 bg-white/10' : 'border-white/10'
                        }`}
                        placeholder="Telefon"
                        required
                      />
                    </div>
                  </div>
                  {/* Email */}
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white text-sm focus:outline-none transition-all ${
                      focusedField === 'email' ? 'border-teal-500 bg-white/10' : 'border-white/10'
                    }`}
                    placeholder="E-Posta"
                    required
                  />
                  {/* Message */}
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    rows={4}
                    className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white text-sm focus:outline-none transition-all resize-none ${
                      focusedField === 'message' ? 'border-teal-500 bg-white/10' : 'border-white/10'
                    }`}
                    placeholder="Mesajınız"
                    required
                  />
                  {/* Submit Button with Glow */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    <Send size={16} />
                    Gönder
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
