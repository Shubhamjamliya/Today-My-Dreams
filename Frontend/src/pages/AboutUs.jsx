import { motion } from 'framer-motion';
import { MapPin, Mail, Clock, Award, Users, Smile, Star, Palette, Handshake, ShieldCheck, Sparkles } from 'lucide-react';
import SEO from '../components/SEO/SEO';

// --- Helper Component for Background Shapes ---
const BackgroundShapes = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
            initial={{ opacity: 0, y: 100, x: -100, rotate: -45 }}
            animate={{ opacity: 0.05, y: -100, x: 50, rotate: 15 }}
            transition={{ duration: 60, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-300 rounded-full"
        />
        <motion.div
            initial={{ opacity: 0, y: -100, x: 100, rotate: 45 }}
            animate={{ opacity: 0.05, y: 100, x: -50, rotate: -15 }}
            transition={{ duration: 70, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-amber-300 rounded-full"
        />
    </div>
);

const AboutUs = () => {
    const stats = [
        { icon: Sparkles, number: "1,000+", label: "Celebrations Hosted" },
        { icon: Award, number: "2+", label: "Years of Experience" },
        { icon: Users, number: "200+", label: "Creative Partners" },
        { icon: Star, number: "4.7", label: "Client Rating" }
    ];

    const values = [
        { title: "Bespoke Creativity", description: "Personalized designs that reflect your individual style and create unforgettable atmospheres.", icon: Palette },
        { title: "Curated Excellence", description: "We partner with talented decorators, ensuring every detail is executed to perfection.", icon: ShieldCheck },
        { title: "Seamless Experience", description: "From browsing to booking, we make the entire process effortless, transparent, and joyful for you.", icon: Smile },
        { title: "Passionate Partnership", description: "We work as dedicated partners with clients and vendors to achieve stunning results.", icon: Handshake }
    ];

    return (
        <div className="w-full bg-amber-50/50 font-sans" style={{ backgroundImage: `url("data:image/svg+xml,...")` }}>
            <SEO
                title="About TodayMyDream - Our Story & Mission"
                description="Learn about TodayMyDream's journey in transforming celebrations with premium decoration services."
                keywords="about us, our story, wedding decorations, event planning, birthday party decor, anniversary celebrations"
                url="https://todaymydream.com/about"
                image="/beautiful-wedding-decor.jpg"
            />
            <BackgroundShapes />

            <section className="relative py-16 sm:py-20 md:py-32 overflow-hidden text-white bg-slate-800">
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/last.png')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-4">
                            Designing Moments, Creating Memories
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                            From intimate birthdays to grand wedding celebrations, we are your partners in crafting beautiful, unforgettable events.
                        </p>
                        <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
                    </motion.div>
                </div>
            </section>

            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white p-4 rounded-xl shadow-lg shadow-amber-200/30 border border-amber-200/50"
                            >
                                <stat.icon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold font-serif text-slate-900">{stat.number}</p>
                                <p className="text-xs text-slate-600 mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 sm:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">
                                Our Story of Passion
                            </h2>
                            <div className="space-y-4 text-base text-slate-600 leading-relaxed">
                                <p>Our journey began with a simple belief: every milestone deserves to be beautiful. We saw families struggling to find creative, reliable partners to bring their decorative visions to life.</p>
                                <p>We wanted to replace that stress with joy, leading to a curated platform where you can connect with the best, pre-vetted decor artists and venues.</p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8 }}
                            className="w-full h-80 md:h-full rounded-2xl shadow-2xl shadow-amber-200/50 overflow-hidden border-4 border-white"
                        >
                            <img src="/left.png" alt="A beautifully decorated anniversary dinner table" className="w-full h-full object-cover" />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-12 sm:py-20 bg-white/50 backdrop-blur-sm border-y border-amber-200/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-10 md:mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">Our Core Values</h2>
                        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
                            The principles that guide us in making every celebration perfect.
                        </p>
                    </motion.div>

                    {/* Changed: grid-cols-2 is now the default for mobile */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                // Changed: Made card more compact with p-4
                                className="bg-white p-4 text-center rounded-xl shadow-lg shadow-amber-200/30 border border-amber-200/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                            >
                                <div className="inline-block p-3 bg-amber-100 rounded-full mb-3">
                                    <value.icon className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 mb-1">{value.title}</h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 sm:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">Let's Plan Your Celebration</h2>
                        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
                            Ready to start planning? Get in touch with our team of celebration specialists.
                        </p>
                    </motion.div>

                    {/* Changed: grid-cols-2 on mobile, with the last item wrapping */}
                    <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <ContactCard icon={MapPin} title="Our Office" lines={["Arrah, Bihar, India"]} />
                        <ContactCard icon={Mail} title="Email Us" lines={["support@decoryy.com"]} isLink href="mailto:support@decoryy.com" />
                    </div>
                </div>
            </section>
        </div>
    );
};

// Helper for Contact Cards - Made more compact for mobile
const ContactCard = ({ icon: Icon, title, lines, isLink = false, href = "#" }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
    >
        <a
            href={isLink ? href : undefined}
            // Changed: Reduced padding and text sizes
            className={`block bg-white p-4 text-center rounded-xl shadow-lg shadow-amber-200/30 border border-amber-200/50 h-full ${isLink ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1' : ''}`}
        >
            <Icon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
            <div className="text-xs text-slate-600">
                {lines.map((line, i) => <p key={i}>{line}</p>)}
            </div>
        </a>
    </motion.div>
);

export default AboutUs;