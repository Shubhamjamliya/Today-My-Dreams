import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Award, Sparkles, ThumbsUp, ChevronDown } from 'lucide-react';
import { categoryAPI, cityAPI } from '../../services/api';
import { useCity } from '../../context/CityContext';
import { useSettings } from '../../context/SettingsContext';
import logo from '/TodayMyDream.png';

const FooterAccordion = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-700 lg:border-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4"
      >
        <h3 className="text-md font-bold text-white uppercase tracking-wider">{title}</h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="text-amber-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 pt-2 pb-4">
              {items.map((item, index) => (
                <li key={index}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="text-sm text-slate-400 hover:text-amber-500 transition-colors text-left w-full"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link to={item.link} className="text-sm text-slate-400 hover:text-amber-500 transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  const { setSelectedCity, setSelectedCityId } = useCity();
  const { getContactInfo } = useSettings();
  const { socials } = getContactInfo();

  const [footerCategories, setFooterCategories] = useState([]);
  const [footerCities, setFooterCities] = useState([]);

  useEffect(() => {
    const fetchFooterCategories = async () => {
      try {
        const response = await categoryAPI.getCategories();
        let cats = [];

        if (response && response.data) {
          if (Array.isArray(response.data)) cats = response.data;
          else if (Array.isArray(response.data.categories)) cats = response.data.categories;
          else if (Array.isArray(response.data.category)) cats = response.data.category;
        }

        const validated = cats
          .filter(c => c && (typeof c === 'object') && (c.name || c.title))
          .map(c => ({ name: (c.name || c.title || '').trim(), id: c._id || c.id }))
          .filter(c => c.name && c.name.length > 0);

        setFooterCategories(validated.slice(0, 8));
      } catch (error) {
        setFooterCategories([]);
      }
    };

    fetchFooterCategories();
  }, []);

  useEffect(() => {
    const fetchFooterCities = async () => {
      try {
        const response = await cityAPI.getCities();
        const allCities = response.data.cities || [];
        const activeCities = allCities.filter(city => city.isActive !== false);
        setFooterCities(activeCities.slice(0, 8));
      } catch (error) {
        setFooterCities([]);
      }
    };

    fetchFooterCities();
  }, []);

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 }
    }
  };

  const whyChooseUsPoints = [
    { icon: <Award size={20} />, text: "Professional Services" },
    { icon: <Sparkles size={20} />, text: "Bespoke & Creative Decorations" },
    { icon: <ThumbsUp size={20} />, text: "Seamless Booking Experience" },
  ];

  const usefulLinks = [
    { label: "About Us", link: "/about" },
    { label: "Contact Us", link: "/contact" },
    { label: "Blog", link: "/blog" },
    { label: "Policies", link: "/policies" },
  ];

  const fallbackCategoryLinks = [
    { label: 'Balloons', link: '/shop?category=Balloons' },
    { label: 'Birthday', link: '/shop?category=Birthday' },
    { label: 'Wedding', link: '/shop?category=Wedding' },
    { label: 'Anniversary', link: '/shop?category=Anniversary' },
  ];

  const categoryLinks = (footerCategories && footerCategories.length > 0
    ? footerCategories.slice(0, 10).map(cat => ({ label: cat.name, link: `/shop?category=${encodeURIComponent(cat.name)}` }))
    : fallbackCategoryLinks
  );

  const handleCityClick = (city) => {
    setSelectedCity(city.name);
    setSelectedCityId(city._id);
    navigate(`/?city=${encodeURIComponent(city.name)}`);
    window.scrollTo(0, 0);
  };

  const cityLinks = footerCities.map(city => ({
    label: city.name,
    onClick: () => handleCityClick(city)
  }));

  return (
    <motion.footer
      className="bg-slate-950 text-slate-400 pt-10 pb-6 border-t border-slate-800"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-4 lg:gap-x-8">

          {/* Column 1: Brand (Span 3) */}
          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <Link to="/" className="inline-block">
              <img src={logo} alt="Today My Dream" className="h-10 mb-3 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-xs leading-relaxed text-slate-500 mb-4 max-w-xs">
              Your premier destination for booking bespoke decorations. Making life's moments unforgettable, one event at a time.
            </p>
            {/* Socials Inline */}
            <div className="flex items-center gap-3">
              {socials?.facebook && (
                <a
                  href={socials.facebook.startsWith('http') ? socials.facebook : `https://${socials.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#FCD24C] hover:text-slate-900 hover:border-[#FCD24C] transition-all"
                >
                  <Facebook size={14} />
                </a>
              )}
              {socials?.instagram && (
                <a
                  href={socials.instagram.startsWith('http') ? socials.instagram : `https://${socials.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#FCD24C] hover:text-slate-900 hover:border-[#FCD24C] transition-all"
                >
                  <Instagram size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Useful Links (Span 2) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Company</h3>
            <ul className="space-y-1.5">
              {usefulLinks.map((link, i) => (
                <li key={i}><Link to={link.link} className="text-[11px] font-medium hover:text-[#FCD24C] transition-colors flex items-center gap-1.5"><span className="w-1 h-1 bg-slate-700 rounded-full"></span>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories (Span 2) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Collections</h3>
            <ul className="space-y-1.5">
              {categoryLinks.slice(0, 6).map((link, i) => (
                <li key={i}><Link to={link.link} className="text-[11px] font-medium hover:text-[#FCD24C] transition-colors flex items-center gap-1.5"><span className="w-1 h-1 bg-slate-700 rounded-full"></span>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Column 4: Cities (Span 2) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Cities</h3>
            <ul className="space-y-1.5">
              {cityLinks.length > 0 ? (
                cityLinks.slice(0, 6).map((city, i) => (
                  <li key={i}>
                    <button onClick={city.onClick} className="text-[11px] font-medium hover:text-[#FCD24C] transition-colors text-left flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>{city.label}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-[10px] italic text-slate-600">Loading...</li>
              )}
            </ul>
          </div>

          {/* Column 5: Why Us (Span 3) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Why Us?</h3>
            <ul className="space-y-2.5">
              {whyChooseUsPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="text-[#FCD24C] mt-0.5">{React.cloneElement(point.icon, { size: 14 })}</span>
                  <span className="text-[11px] leading-tight text-slate-400 font-medium">{point.text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
            &copy; {new Date().getFullYear()} Today My Dream. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/policies" className="text-[10px] font-bold uppercase hover:text-white transition-colors">Privacy</Link>
            <Link to="/policies" className="text-[10px] font-bold uppercase hover:text-white transition-colors">Terms</Link>
            <Link to="/contact" className="text-[10px] font-bold uppercase hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
