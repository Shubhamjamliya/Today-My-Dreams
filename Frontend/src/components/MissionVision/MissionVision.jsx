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
    // Changed: Softer border color and responsive padding
    <div className="border-b border-slate-200/80 py-5 last:border-b-0">
      <button
        className="flex justify-between items-center w-full text-left group"
        onClick={onClick}
      >
        <h3 className="text-md sm:text-lg font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
            {question}
        </h3>
        {/* Changed: Replaced icon with a more elegant chevron and wrapper */}
        <div className="flex-shrink-0 ml-4 w-8 h-8 flex items-center justify-center bg-amber-50 rounded-full">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className={`w-5 h-5 text-amber-600`} />
            </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Changed: Softer text color and responsive font size */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pr-12">{answer}</p>
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
    // Changed: Added themed background
    <section className="  font-sans relative" >
      <BackgroundShapes />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
         
          {/* Changed: Restyled heading with serif font and new colors */}
          <h1 className="text-2xl md:text-2xl font-serif font-bold text-slate-900">
            Frequently Asked Questions
          </h1>
        
        </div>

        {/* Changed: Restyled accordion container to be a premium card */}
        <div className="max-w-3xl mx-auto mt-4 bg-white px-4 sm:px-8 py-2 rounded-2xl  border border-amber-200/60">
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

        <div className="text-center mt-6">
            {/* Changed: Restyled text with serif font */}
            <h3 className="text-2xl font-serif font-bold text-slate-800">Still have questions?</h3>
            <p className="mt-2 text-slate-600">We're here to help! Contact our support team for any further inquiries.</p>
            {/* Changed: Restyled button to match the primary CTA style */}
            <motion.a 
              href="/contact" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 inline-block bg-amber-500 text-white font-bold py-2 px-3 rounded-full text-lg "
            >
              Contact Us
            </motion.a>
        </div>
      </div>
    </section>
  );
};

export default FaqPage;