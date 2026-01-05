import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    quote: "The team transformed our son's birthday into a magical wonderland! Their creativity is unmatched.",
    name: "Priya S.",
    event: "Kids Birthday Party",
    rating: 5,
    initial: "P"
  },
  {
    quote: "For our 10th anniversary, we wanted something elegant and they met all our expectations.",
    name: "Ankit Sharma",
    event: "Anniversary Celebration",
    rating: 5,
    initial: "A"
  },
  {
    quote: "Our annual corporate event was a huge success, thanks to the stunning arrangements.",
    name: "Sunita Rout",
    event: "Corporate Event",
    rating: 5,
    initial: "S"
  },
  {
    quote: "The baby shower decorations were absolutely adorable! The attention to detail was incredible.",
    name: "Vikram Das",
    event: "Baby Shower",
    rating: 5,
    initial: "V"
  },
  {
    quote: "Outstanding service! They handled everything from decor to catering coordination perfectly.",
    name: "Rahul Verma",
    event: "Wedding Reception",
    rating: 5,
    initial: "R"
  },
  {
    quote: "Simple, elegant, and timely. Best decoration service in the city.",
    name: "Meera K.",
    event: "House Warming",
    rating: 5,
    initial: "M"
  }
];

const Testimonials = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative group/section overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">

        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white text-slate-800 rounded-full shadow-xl items-center justify-center hover:bg-amber-500 hover:text-white transition-all opacity-0 group-hover/section:opacity-100 duration-300 border border-slate-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white text-slate-800 rounded-full shadow-xl items-center justify-center hover:bg-amber-500 hover:text-white transition-all opacity-0 group-hover/section:opacity-100 duration-300 border border-slate-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>

        {/* Carousel */}
        <motion.div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-12 scrollbar-hide scroll-smooth px-2"
        >
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex-shrink-0 snap-center w-[85vw] sm:w-[320px] md:w-[360px]"
            >
              <div className="bg-white rounded-2xl p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-5px_rgba(245,158,11,0.2)] transition-all duration-300 border border-slate-50 hover:border-amber-100 relative h-full flex flex-col group/card cursor-pointer">

                {/* Quote Icon Background */}
                <div className="absolute top-4 right-6 text-slate-100 group-hover/card:text-amber-50 transition-colors">
                  <Quote size={64} fill="currentColor" className="opacity-50" />
                </div>

                <div className="relative z-10 flex-grow">
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-slate-700 text-lg leading-relaxed font-serif italic mb-6">"{review.quote}"</p>
                </div>

                <div className="relative z-10 pt-6 mt-2 border-t border-slate-50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white group-hover/card:ring-amber-500 transition-all">
                    {review.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover/card:text-amber-600 transition-colors uppercase tracking-wide">{review.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{review.event}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;