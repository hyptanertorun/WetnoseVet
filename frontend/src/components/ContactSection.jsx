import React, { useEffect, useRef, useState } from 'react';
import { siteInfo } from '../data/mockData';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ArrowRight } from 'lucide-react';

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
    { icon: MapPin, label: 'Adres', value: siteInfo.address },
    { icon: Phone, label: 'Telefon', value: siteInfo.phone },
    { icon: Mail, label: 'E-Posta', value: siteInfo.email },
    { icon: Clock, label: 'Çalışma', value: '7/24 Açık' }
  ];

  return (
    <section 
      id="iletisim" 
      ref={sectionRef}
      className="relative min-h-screen bg-gray-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Left - Info */}
            <div className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-20 bg-teal-500" />
                <span className="text-teal-400 text-sm tracking-[0.3em] uppercase font-medium">İletişim</span>
              </div>

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none mb-8">
                BİZE
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500">
                  ULAŞIN
                </span>
              </h2>

              <p className="text-xl text-white/60 leading-relaxed mb-12 max-w-lg">
                Sorularınız veya randevu talepleriniz için bize ulaşın. En kısa sürede dönüş yapalım.
              </p>

              {/* Contact Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <div 
                    key={info.label}
                    className={`group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-teal-500/50 transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 mb-4 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                      <info.icon size={24} />
                    </div>
                    <div className="text-white/40 text-sm mb-1">{info.label}</div>
                    <div className="text-white font-medium text-sm">{info.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Form */}
            <div className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              <div className="bg-white rounded-3xl p-10 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Randevu Formu</h3>
                <p className="text-gray-600 mb-8">Formu doldurun, sizi arayalim</p>

                {isSubmitted ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} className="text-teal-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Mesaj Gönderildi!</h4>
                    <p className="text-gray-600">En kısa sürede dönüş yapacağız.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-200 focus:border-teal-500 outline-none transition-colors text-gray-900 peer"
                          placeholder=" "
                          required
                        />
                        <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                          formData.name || focusedField === 'name' ? '-top-2 text-xs text-teal-600' : 'top-4 text-gray-500'
                        }`}>Adınız Soyadınız</label>
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-200 focus:border-teal-500 outline-none transition-colors text-gray-900"
                          placeholder=" "
                          required
                        />
                        <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                          formData.phone || focusedField === 'phone' ? '-top-2 text-xs text-teal-600' : 'top-4 text-gray-500'
                        }`}>Telefon</label>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-200 focus:border-teal-500 outline-none transition-colors text-gray-900"
                        placeholder=" "
                        required
                      />
                      <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                        formData.email || focusedField === 'email' ? '-top-2 text-xs text-teal-600' : 'top-4 text-gray-500'
                      }`}>E-Posta</label>
                    </div>

                    {/* Message */}
                    <div className="relative">
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        rows={4}
                        className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-200 focus:border-teal-500 outline-none transition-colors text-gray-900 resize-none"
                        placeholder=" "
                        required
                      />
                      <label className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                        formData.message || focusedField === 'message' ? '-top-2 text-xs text-teal-600' : 'top-4 text-gray-500'
                      }`}>Mesajınız</label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-5 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-teal-600 transition-colors flex items-center justify-center gap-3 group"
                    >
                      <Send size={20} />
                      Gönder
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
