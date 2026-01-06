import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Send, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO/SEO';

import { useSettings } from '../context/SettingsContext';

const ContactPage = () => {
  const { getContactInfo } = useSettings();
  const { email, phone, address } = getContactInfo();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  const recipientEmail = email || "support@todaymydream.com";
  const mailSubject = encodeURIComponent(formData.subject || `Inquiry from ${formData.name}`);
  const body = encodeURIComponent(
    `Hello,\n\n${formData.message}\n\n---\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}`
  );
  const mailtoLink = `mailto:${recipientEmail}?subject=${mailSubject}&body=${body}`;

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: phone || "+91 9876543210",
      link: `tel:${(phone || "").replace(/\s+/g, '')}`
    },
    {
      icon: Mail,
      title: "Email",
      value: email || "support@todaymydream.com",
      link: `mailto:${email || "support@todaymydream.com"}`
    },
    {
      icon: MapPin,
      title: "Office",
      value: address || "New Delhi, India",
      link: "#"
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      <SEO
        title="Contact Today My Dream - Get in Touch"
        description="Contact us for inquiries about decoration services, vendor partnerships, or support."
        keywords="contact us, customer support, event planning inquiry, vendor support"
        url="https://todaymydream.com/contact"
      />

      {/* Hero Section */}
      <section className="bg-slate-900 relative pt-32 pb-48 lg:pt-40 lg:pb-64 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-slate-800 to-transparent opacity-40"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-slate-800 border border-slate-700 text-amber-500 text-sm font-medium mb-6">
              24/7 Support
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 font-serif">
              Get in <span className="text-amber-500">Touch</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Have a question about our services or ready to plan your next big event?
              We're here to help you every step of the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section (Overlapping Hero) */}
      <section className="relative z-20 -mt-32 px-4 lg:px-8 mb-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
          >
            {/* Left Sidebar (Contact Info) */}
            <div className="lg:w-2/5 bg-slate-900 p-8 lg:p-12 text-white relative overflow-hidden flex flex-col justify-between">
              {/* Decorative Circles */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

              <div className="relative z-10">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 font-serif">Contact Information</h2>
                <p className="text-slate-400 mb-12">Fill up the form and our Team will get back to you within 24 hours.</p>

                <div className="space-y-8">
                  {contactInfo.map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      className="flex items-start gap-4 group p-4 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                      <div className="p-3 bg-amber-500 text-slate-900 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{item.title}</h3>
                        <p className="text-lg font-semibold group-hover:text-amber-400 transition-colors">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
                <div className="flex gap-4">
                  {/* Social Icons placeholders if needed, or keeping it clean */}
                  {/* <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-all cursor-pointer"><Facebook size={18}/></div> */}
                </div>
              </div>
            </div>

            {/* Right Content (Form) */}
            <div className="lg:w-3/5 p-8 lg:p-16 bg-white">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text" id="name" placeholder="John Doe"
                      className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-amber-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel" id="phone" placeholder="+91 98765 43210"
                      className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-amber-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email" id="email" placeholder="john@example.com"
                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-amber-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Subject</label>
                  <input
                    type="text" id="subject" placeholder="General Inquiry / Booking"
                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-amber-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Message</label>
                  <textarea
                    id="message" rows="5" placeholder="Tell us about your event or question..."
                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-amber-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="pt-4">
                  <motion.a
                    href={mailtoLink}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-amber-500 text-slate-900 font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-amber-400 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <Send size={20} />
                    Send Message
                  </motion.a>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ or Additional Section (Optional, serves as footer spacer) */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-500 mb-4 font-serif italic text-xl">"Designing Moments, Creating Memories"</p>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
