import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Building2, TrendingUp } from 'lucide-react';

const VendorBanner = () => {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background with Gradient and Pattern */}
      <div className="absolute inset-0 bg-slate-900 border-y border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-purple-600/20 opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        {/* Static Glow Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative group">
          {/* Corner Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110 duration-700"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">

            {/* Text Content */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold uppercase tracking-wider"
              >
                <Building2 size={16} />
                <span>Partner with Us</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight"
              >
                Become our Partner Vendor <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                  Now in your City
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-300 md:max-w-xl"
              >
                Join thousands of successful businesses on Today My Dream. Expand your reach for Birthday, Wedding, and Event services, manage bookings effortlessly, and grow your revenue.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2"
              >
                <Link
                  to="/vendor/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-1"
                >
                  <span>Register as Vendor</span>
                  <ArrowRight size={20} />
                </Link>

                <div className="flex items-center gap-2 px-6 py-4 text-slate-400 font-medium">
                  <TrendingUp size={20} className="text-green-400" />
                  <span>Zero listing fees</span>
                </div>
              </motion.div>
            </div>

            {/* Decorative Visual/Icon */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="hidden md:block" // Hide on small mobile to save vertical space
            >
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-purple-600 rounded-full opacity-20"></div>
                <div className="absolute inset-4 bg-slate-900 rounded-full border border-white/10 flex items-center justify-center shadow-2xl">
                  <Sparkles size={80} className="text-amber-500" />
                </div>
                {/* Static Orbit Elements */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-glow">
                    <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorBanner;
