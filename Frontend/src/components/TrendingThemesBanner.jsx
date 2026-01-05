import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, PartyPopper } from 'lucide-react';

const TrendingThemesBanner = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-slate-900 text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 opacity-90"></div>

        {/* Animated Spotlight/Glow Effects */}
        {/* Static Spotlights (Optimized) */}
        <div className="absolute -top-1/2 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-1/2 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px]" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 text-amber-500/40"
        >
          <Sparkles size={48} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 text-purple-400/40"
        >
          <Star size={56} />
        </motion.div>
        {/* Confetti-like dots */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 10 + 4 + 'px',
              height: Math.random() * 10 + 4 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 font-bold text-sm tracking-widest uppercase mb-6">
            <PartyPopper size={16} className="text-amber-400" />
            <span>Most Popular Now</span>
          </div>

          <h2 className="text-4xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 tracking-tight mb-6 drop-shadow-sm">
            Trending Themes
          </h2>

          <p className="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            From intimate gatherings to grand celebrations, <br className="hidden md:block" />
            explore the styles that everyone is talking about.
          </p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-10"
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingThemesBanner;
