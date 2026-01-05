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
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 bg-slate-50 relative group/section overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* Navigation - Minimalist */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none flex justify-between z-20 px-2">
          <button
            onClick={() => scroll('left')}
            className="pointer-events-auto w-10 h-10 bg-white/80 backdrop-blur-md text-slate-800 rounded-full shadow-lg flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all border border-slate-100"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="pointer-events-auto w-10 h-10 bg-white/80 backdrop-blur-md text-slate-800 rounded-full shadow-lg flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all border border-slate-100"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Carousel */}
        <motion.div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide scroll-smooth px-1"
        >
          {reviews.map((review, index) => {
            const colors = [
              { border: 'group-hover:border-pink-200', accent: 'bg-pink-500', text: 'text-pink-600', bg: 'bg-pink-50', quote: 'text-pink-200' },
              { border: 'group-hover:border-rose-200', accent: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', quote: 'text-rose-200' },
              { border: 'group-hover:border-sky-200', accent: 'bg-sky-500', text: 'text-sky-600', bg: 'bg-sky-50', quote: 'text-sky-200' },
              { border: 'group-hover:border-purple-200', accent: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', quote: 'text-purple-200' },
              { border: 'group-hover:border-emerald-200', accent: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', quote: 'text-emerald-200' },
              { border: 'group-hover:border-amber-200', accent: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', quote: 'text-amber-200' },
            ];
            const theme = colors[index % colors.length];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 snap-center w-[85vw] sm:w-[280px] md:w-[320px]"
              >
                <div className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 ${theme.border} h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden`}>

                  {/* Accent Line - Colored */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Quote size={24} className={`${theme.quote} transform group-hover:scale-110 transition-transform`} />
                    </div>

                    <p className="text-slate-600 text-[15px] leading-relaxed font-medium mb-4 line-clamp-3 relative">
                      <span className={`absolute -left-2 -top-2 text-4xl opacity-10 font-serif ${theme.text}`}>"</span>
                      {review.quote}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div className={`w-10 h-10 rounded-full ${theme.bg} ${theme.text} flex items-center justify-center font-bold text-sm shadow-inner`}>
                      {review.initial}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm uppercase tracking-wider transition-colors ${theme.text}`}>{review.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{review.event}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;