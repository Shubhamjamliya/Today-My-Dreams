import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus } from 'react-icons/fa';

// --- FAQ Data ---
// Easily add, remove, or edit questions and answers here
const faqData = [
  {
    question: "What kind of events do you provide your decorations for?",
    answer: "We provide decorations for a wide variety of celebrations including happy birthdays, anniversaries, baby showers, newborn baby welcomes, baby boy & girl welcomes, bachelorette parties, and more."
  },
  {
    question: "How do we book a service with you?",
    answer: "Booking is simple! Go to decoryy.com, select your city by entering your PIN code, choose the service you would like, and then proceed to payment to confirm your booking."
  },
  {
    question: "How much does simple birthday decoration cost?",
    answer: "Our decoration packages are designed to be affordable, starting at just ₹999. The final price varies depending on the complexity of the theme, the size of the setup, and any custom additions."
  },
  {
    question: "In which cities we are available?",
    answer: "We are proud to offer our balloon decoration services in over 100 cities across India. This includes major hubs like Delhi, Mumbai, Bangalore, Hyderabad, Kolkata, Pune, Chennai, and many more."
  },
  {
    question: "How can we contact you?",
    answer: "You can easily get in touch with us by sending an email or by using the contact options provided on our official website. We're always happy to help!"
  }
];

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200 py-6">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={onClick}
      >
        <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaPlus className={`text-purple-600 ${isOpen ? 'transform rotate-45' : ''}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="text-gray-600 leading-relaxed">{answer}</p>
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
    <section className="bg-gray-50 py-20 md:py-28">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Find answers to common questions about our services, booking process, and availability.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
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

        <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-gray-800">Still have questions?</h3>
            <p className="mt-2 text-gray-600">We're here to help! Contact our support team for any further inquiries.</p>
            <a 
              href="/contact" 
              className="mt-6 inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Contact Us
            </a>
        </div>
      </div>
    </section>
  );
};

export default FaqPage;