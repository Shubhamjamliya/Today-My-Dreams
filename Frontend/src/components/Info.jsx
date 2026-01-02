import React from 'react';
import { motion } from 'framer-motion';
import { Cake, Gem, Baby, Heart, UserCheck, Tag, Palette, ThumbsUp } from 'lucide-react'; 
import whyChooseUsImage from '/last.png';

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

        {/* --- 1. Introduction --- */}
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-2xl md:text-2xl font-serif font-bold text-slate-900 leading-tight">
            Decorate Your Home with Our 
            <span className="relative inline-block mx-3 text-amber-600">
              Professional
              <motion.svg
                className="absolute -bottom-2 left-0 w-full h-auto text-amber-500"
                viewBox="0 0 100 8"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5, ease: 'easeInOut' }}
              >
                <path d="M 2 5 C 20 2, 80 2, 98 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </motion.svg>
            </span>
              Service
          </h2>
          <p className="mt-6 text-sm text-lg text-slate-600">
            Decoration is an indispensable part of any celebration. A little touch of our magic can elevate your birthdays, anniversaries, and baby showers, creating a vibrant and happy mood for you and your guests.
          </p>
        </motion.div>

        {/* --- 2. Our Services (Now a Slider on Mobile) --- */}
        <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            
           
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:pb-0">
                {services.map((service, index) => (
                    // Added classes to make the cards work inside the slider
                    <motion.div 
                        key={index} 
                        variants={itemVariants} 
                        className="flex-shrink-0 snap-center w-[80%] sm:w-[45%] lg:w-auto bg-white p-6 rounded-2xl  border border-amber-200/50 text-center"
                    >
                        <div className="inline-block p-4  -100 text-amber-600 rounded-full mb-4">
                            {service.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">{service.title}</h3>
                        <p className="text-slate-500 text-sm">{service.description}</p>
                    </motion.div>
                ))}
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
            <h2 className="text-2xl  md:text-xl font-serif font-bold text-slate-900 mb-4">Why Choose Us?</h2>
            <div className="space-y-6">
              {whyChooseUsPoints.map((point, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-6 w-12 h-12 flex items-center justify-center   text-amber-600 rounded-full mr-5">
                    {point.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-slate-800">{point.title}</h4>
                    <p className="text-slate-600 text-sm">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            className="lg:w-1/2 mt-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img src={whyChooseUsImage} alt="Elegant party decoration setup" className="rounded-2xl  w-full border-4 border-white" />
          </motion.div>
        </div>

   
      </div>
    </section>
  );
};

export default InfoSection;