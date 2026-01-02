import React from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const reviews = [
  {
    quote: "The team transformed our son's birthday into a magical wonderland! Their creativity is unmatched.",
    name: "Priya S.",
    event: "Kids Birthday Party",
    rating: 5,
  },
  {
    quote: "For our 10th anniversary, we wanted something elegant and they met all our expectations.",
    name: "Ankit Sharma",
    event: "Anniversary Celebration",
    rating: 5,
  },
  {
    quote: "Our annual corporate event was a huge success, thanks to the stunning arrangements.",
    name: "Sunita Rout",
    event: "Corporate Event",
    rating: 5,
  },
  {
    quote: "The baby shower decorations were absolutely adorable! The attention to detail was incredible.",
    name: "Vikram Das",
    event: "Baby Shower",
    rating: 5,
  },
];

const ReviewSection = () => {
  return (
    <section className="py-4 sm:py-6 md:py-8 overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 md:px-8">
        <motion.div
          className="text-center "
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl sm:text-2xl md:text-2xl font-serif font-bold text-slate-900 mb-4">
            Words of <span className="text-amber-600">Joy</span> from Our Clients
          </h2>
         
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1 }}
        >
         
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8  sm:overflow-visible sm:pb-0">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                // Changed: Added classes for the slider behavior on mobile
                className="flex-shrink-0 snap-center w-[85%] sm:w-auto bg-white  rounded-2xl  p-6 flex flex-col justify-between relative border border-amber-200/50"
              >
                <FaQuoteLeft className="text-6xl text-amber-100/80 absolute top-4 left-4" />
                <div className="flex-grow z-10 pt-4">
                  <p className="text-slate-600 italic leading-relaxed">"{review.quote}"</p>
                </div>
                <div className="z-10 pt-4 border-t border-slate-100">
                  <div className="flex items-center ">
                    {Array(review.rating)
                      .fill(0)
                      .map((_, i) => (
                        <FaStar key={i} className="text-amber-400" />
                      ))}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-lg">{review.name}</h4>
                  <p className="text-sm text-amber-700 font-medium">
                    {review.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewSection;