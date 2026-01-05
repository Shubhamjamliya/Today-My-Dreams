import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react'; // Using more modern and consistent icons

// --- FAQ Data ---
const faqData = [
  {
    question: "What kind of events do you provide decorations for?",
    answer: "We specialize in a wide variety of celebrations including birthdays, anniversaries, baby showers, newborn welcomes, bachelorette parties, and much more. Our goal is to make any special occasion beautiful."
  },
  {
    question: "How do I book a service with you?",
    answer: "Booking is simple! Just browse our website, select the city where you need the service, choose your favorite decoration package, and proceed to payment to confirm your booking instantly."
  },
  {
    question: "What is the starting cost for a simple birthday decoration?",
    answer: "Our decoration packages are designed to be accessible, with options starting as low as ₹999. The final price depends on the theme's complexity, the size of the setup, and any custom elements you wish to add."
  },
  {
    question: "In which cities are your services available?",
    answer: "We are proud to offer our decoration services in over 100 cities across India, including major hubs like Delhi, Mumbai, Bangalore, Hyderabad, Kolkata, Pune, and Chennai."
  },
  {
    question: "How can I contact your team for custom inquiries?",
    answer: "You can easily get in touch by sending us an email or by using the contact options on our website. Our team is always happy to discuss custom decorations for your event!"
  }
];

// --- Helper Component for Background Shapes ---
const BackgroundShapes = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <motion.div
      initial={{ opacity: 0, y: 100, x: -100, rotate: -45 }}
      animate={{ opacity: 0.05, y: -100, x: 50, rotate: 15 }}
      transition={{ duration: 60, repeat: Infinity, repeatType: 'reverse' }}
      className="absolute -bottom-40 -left-40 w-96 h-96  rounded-full"
    />
  </div>
);


const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`border-b border-slate-100 py-4 last:border-b-0 transition-all duration-300 ${isOpen ? 'bg-amber-50/30' : ''}`}>
      <button
        className="flex justify-between items-center w-full text-left group px-4 py-2"
        onClick={onClick}
      >
        <h3 className={`text-base sm:text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-amber-600' : 'text-slate-700 group-hover:text-amber-600'}`}>
          {question}
        </h3>
        <div className={`flex-shrink-0 ml-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-amber-100 text-amber-600 rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-500'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed px-4 pb-4 pt-1">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const FaqPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleItemClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="font-sans relative py-8 md:py-16">
      <BackgroundShapes />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 text-sm md:text-base">Everything you need to know about our services.</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {faqData.map((item, index) => (
            <AccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={activeIndex === index}
              onClick={() => handleItemClick(index)}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <h3 className="text-xl font-serif font-bold text-slate-800">Still have questions?</h3>
          <p className="mt-2 text-slate-500 text-sm">We're here to help! Contact our support team.</p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all"
          >
            Contact Us
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default FaqPage;