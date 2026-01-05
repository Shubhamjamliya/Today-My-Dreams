import React from 'react';
import { motion } from 'framer-motion';
import { Cake, Gem, Baby, Heart, UserCheck, Tag, Palette, ThumbsUp } from 'lucide-react';
import whyChooseUsImage from '/last.png';
import OptimizedImage from './OptimizedImage';

// --- Data for the component ---
const services = [
  {
    icon: <Cake size={28} />,
    title: 'Birthday Decorations',
    description: "From sweet 16s to surprise parties, we create magical settings with stunning backdrops for that perfect Instagram click!",
  },
  {
    icon: <Gem size={28} />,
    title: 'Anniversary Decoration',
    description: "Surprise your partner in the grandest way with fine anniversary decorations, complete with fresh flowers to express your love.",
  },
  {
    icon: <Baby size={28} />,
    title: 'Baby Shower Decoration',
    description: "We provide affordable and creative options for your baby shower, moving beyond the boring pink and blue themes.",
  },
  {
    icon: <Heart size={28} />,
    title: 'Newborn Welcome',
    description: "Welcome your baby in style. We offer beautiful and safe decorations to give your little one the best party on their first day home.",
  },
];

const whyChooseUsPoints = [
  {
    icon: <UserCheck size={24} />,
    title: 'Trained Professionals',
    description: 'Our experts are exceptionally trained to bring your imagination to life with intricate designs and attention to detail.',
  },
  {
    icon: <Tag size={24} />,
    title: 'Affordable Pricing',
    description: "We keep our prices minimal without compromising on quality, ensuring you get the best value for your money.",
  },
  {
    icon: <Palette size={24} />,
    title: 'Varieties and Themes',
    description: "Tired of the same old decor? Our creative team has curated a huge variety of unique themes to choose from.",
  },
  {
    icon: <ThumbsUp size={24} />,
    title: 'Great Client Reviews',
    description: "We have served numerous happy clients. Read their great reviews and choose from the best in the business.",
  },
];

const cities = [
  'Bangalore', 'Bhubaneswar', 'Chennai', 'Delhi', 'Gurgaon', 'Hyderabad', 'Mumbai', 'Pune', 'Kolkata', 'Noida'
];

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

const InfoSection = () => {
  return (
    <section
      className=" py-4 md:py-12 font-sans"

    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-28">

        {/* --- 1. Introduction: Modern & Professional --- */}
        <motion.div
          className="text-center max-w-4xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-sm font-semibold tracking-wide uppercase">
            ✨ The Power of Decor
          </div>

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-8">
            Transform Spaces into
            <span className="relative block mt-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">
                Unforgettable Memories
              </span>
              <motion.svg
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 md:w-64 h-auto text-amber-200"
                viewBox="0 0 100 8"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <path d="M 2 5 C 20 2, 80 2, 98 5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
              </motion.svg>
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-light">
            Did you know? Decoration isn't just about looks—it sets the entire <span className="font-semibold text-slate-800">mood</span> of your event. From vibrant birthdays to elegant anniversaries, our professional touch turns simple moments into magical stories.
          </p>
        </motion.div>

        {/* --- 2. Our Services (Now a Slider on Mobile) --- */}
        <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>


          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:pb-0">
            {services.map((service, index) => {
              // Defined nice pastel/vibrant colors for each card type
              const colors = [
                { bg: 'bg-gradient-to-br from-amber-50 to-orange-100', text: 'text-amber-900', border: 'border-amber-200', iconColor: 'text-amber-600', iconBg: 'bg-white shadow-sm' },
                { bg: 'bg-gradient-to-br from-rose-50 to-pink-100', text: 'text-rose-900', border: 'border-rose-200', iconColor: 'text-rose-600', iconBg: 'bg-white shadow-sm' },
                { bg: 'bg-gradient-to-br from-sky-50 to-cyan-100', text: 'text-sky-900', border: 'border-sky-200', iconColor: 'text-sky-600', iconBg: 'bg-white shadow-sm' },
                { bg: 'bg-gradient-to-br from-violet-50 to-purple-100', text: 'text-purple-900', border: 'border-purple-200', iconColor: 'text-purple-600', iconBg: 'bg-white shadow-sm' }
              ];
              const theme = colors[index % colors.length];

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`flex-shrink-0 snap-center w-[80%] sm:w-[45%] lg:w-auto ${theme.bg} p-6 rounded-2xl border ${theme.border} shadow-sm hover:shadow-xl transition-all duration-300 md:hover:-translate-y-2 group`}
                >
                  <div className={`inline-block p-4 rounded-2xl mb-6 ${theme.iconBg} ${theme.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${theme.text}`}>{service.title}</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* --- 3. Why Choose Us --- */}
        <div className="flex flex-col lg:flex-row items-center lg:gap-16">
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 mb-8">Why Choose Us?</h2>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              {whyChooseUsPoints.map((point, index) => (
                <div key={index} className="group flex flex-col gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 flex items-center justify-center bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    {point.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 mb-2">{point.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="lg:w-1/2 mt-10 lg:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
              <OptimizedImage
                src={whyChooseUsImage}
                alt="Elegant party decoration setup"
                className="w-full h-full transform hover:scale-105 transition-transform duration-700"
                objectFit="cover"
              />
            </div>
          </motion.div>
        </div>


      </div>
    </section>
  );
};

export default InfoSection;