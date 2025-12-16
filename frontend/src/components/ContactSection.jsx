import React, { useEffect, useRef, useState } from 'react';
import { siteInfo } from '../data/mockData';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

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
      className="py-24 lg:py-32 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-teal-500/50" />
            <span className="text-teal-600 text-xs tracking-[0.25em] uppercase font-medium">İletişim</span>
            <div className="h-px w-8 bg-teal-500/50" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
            Bize <span className="font-semibold">Ulaşın</span>
          </h2>
          
          <p className="text-gray-500 max-w-xl mx-auto font-light">
            Sorularınız veya randevu talepleriniz için bize ulaşın
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className={`lg:col-span-2 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div 
                  key={info.label}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 flex-shrink-0">
                    <info.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">{info.label}</div>
                    <div className="text-gray-700 text-sm font-medium">{info.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="mt-6 h-48 bg-gray-200 rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3019.5!2d29.9!3d40.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzAwLjAiTiAyOcKwNTQnMDAuMCJF!5e0!3m2!1str!2str!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Wetnose Konum"
              />
            </div>
          </div>

          {/* Form */}
          <div className={`lg:col-span-3 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Online Randevu</h3>
              <p className="text-gray-500 text-sm font-light mb-6">Formu doldurun, sizinle iletişime geçelim</p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle size={48} strokeWidth={1} className="text-teal-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">Mesaj Gönderildi!</h4>
                  <p className="text-gray-500 text-sm font-light">En kısa sürede dönüş yapacağız.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Adınız Soyadınız"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                      required
                    />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Telefon"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="E-Posta"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                    required
                  />
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Mesajınız"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={16} strokeWidth={1.5} />
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
