import React from 'react';
import { motion } from 'framer-motion';

const SectionBanner = ({
  title,
  subtitle,
  variant = 'primary', // primary (dark), secondary (gold), light
  className = ''
}) => {

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-amber-500 text-slate-900';
      case 'light':
        return 'bg-slate-50 text-slate-900 border-y border-slate-200';
      case 'primary':
      default:
        return 'bg-slate-900 text-white';
    }
  };

  return (
    <section className={`py-16 md:py-24 relative overflow-hidden ${getVariantStyles()} ${className}`}>
      {/* Decorative Background Elements */}
      {variant === 'primary' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        </div>
      )}
      {variant === 'secondary' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
      )}

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {title && (
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${variant === 'secondary' ? 'text-slate-800' : 'text-slate-400'}`}>
              {subtitle}
            </p>
          )}

          {/* Optional Decoration Line */}
          <div className={`w-24 h-1 mx-auto mt-8 rounded-full ${variant === 'secondary' ? 'bg-slate-900' : 'bg-amber-500'}`}></div>
        </motion.div>
      </div>
    </section>
  );
};

export default SectionBanner;
