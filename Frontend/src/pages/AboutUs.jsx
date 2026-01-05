import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Award, Users, Smile, Star, Palette, Handshake, ShieldCheck, Sparkles, ArrowRight, Heart, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';

const AboutUs = () => {
    const stats = [
        { icon: Sparkles, number: "1,000+", label: "Celebrations Hosted" },
        { icon: Award, number: "2+", label: "Years of Experience" },
        { icon: Users, number: "200+", label: "Creative Partners" },
        { icon: Star, number: "4.7", label: "Client Rating" }
    ];

    const values = [
        {
            title: "Bespoke Creativity",
            description: "Personalized designs that reflect your individual style.",
            icon: Palette,
            color: "bg-purple-50 text-purple-600"
        },
        {
            title: "Curated Excellence",
            description: "We partner with only the most talented professionals.",
            icon: ShieldCheck,
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "Seamless Experience",
            description: "Effortless process from browsing to booking.",
            icon: Smile,
            color: "bg-green-50 text-green-600"
        },
        {
            title: "Passionate Partnership",
            description: "Dedicated to achieving stunning results together.",
            icon: Handshake,
            color: "bg-amber-50 text-amber-600"
        }
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
            <SEO
                title="About Today My Dream - Our Story & Mission"
                description="Learn about Today My Dream's journey in transforming celebrations with premium decoration services."
                keywords="about us, our story, wedding decorations, event planning, birthday party decor, anniversary celebrations"
                url="https://todaymydream.com/about"
                image="/beautiful-wedding-decor.jpg"
            />

            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[500px] flex items-center bg-slate-900 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-slate-800 to-transparent opacity-40"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/20 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="lg:col-span-7"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-500 text-sm font-medium mb-6">
                            <Sparkles size={16} />
                            <span>Redefining Celebrations</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                            We Craft <span className="font-serif italic text-amber-500">Memories</span>, <br /> Not Just Events.
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-400 max-w-xl leading-relaxed mb-8">
                            TodayMyDream connects you with the finest decoration artists and event planners to turn your special moments into timeless experiences.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/contact" className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full transition-all flex items-center gap-2">
                                Start Planning <ArrowRight size={20} />
                            </Link>
                            <Link to="/services" className="px-8 py-3 bg-transparent border border-slate-600 hover:bg-slate-800 text-white font-medium rounded-full transition-all">
                                Explore Services
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section - Floating */}
            <section className="relative z-20 -mt-16 px-6 lg:px-12 mb-20">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 lg:p-12 border border-slate-100"
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-100">
                            {stats.map((stat, index) => (
                                <div key={index} className="px-4 text-center group">
                                    <div className="w-12 h-12 mx-auto bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <stat.icon size={24} />
                                    </div>
                                    <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1 font-serif">{stat.number}</h3>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 lg:py-32 overflow-hidden">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full lg:w-1/2 relative"
                        >
                            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl shadow-slate-200">
                                <OptimizedImage
                                    src="/left.png"
                                    alt="Our Story"
                                    className="w-full h-full transform hover:scale-105 transition-transform duration-700"
                                    objectFit="cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                            </div>
                            {/* Decorative Elements */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FCD24C] rounded-full blur-3xl opacity-20 z-[-1]"></div>
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-10 z-[-1]"></div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-full lg:w-1/2"
                        >
                            <h2 className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">Our Journey</h2>
                            <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-8 font-serif leading-tight">
                                From a Spark to a <br /><span className="text-amber-500 relative inline-block"> Celebration
                                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-amber-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z" fill="currentColor" /></svg>
                                </span>.
                            </h3>
                            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                                <p>
                                    Our journey began with a simple belief: every milestone deserves to be bold, beautiful, and effortless. We saw families struggling to find creative, reliable partners to bring their decorative visions to life, often lost in a sea of uncertain options.
                                </p>
                                <p>
                                    TodayMyDream was born to bridge that gap. We replaced stress with joy, creating a curated ecosystem where you can connect with vetted decor artists who treat your event as their masterpiece.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 className="text-amber-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-slate-900">Vetted Professionals</h4>
                                        <p className="text-sm text-slate-500">Quality you can trust.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 className="text-amber-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-slate-900">Transparent Pricing</h4>
                                        <p className="text-sm text-slate-500">No hidden surprises.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 lg:py-32 bg-slate-50 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 font-serif">Why Choose Us?</h2>
                        <p className="text-xl text-slate-600">Our core values drive every decision we make, ensuring your experience is nothing short of exceptional.</p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group"
                            >
                                <div className={`w-14 h-14 ${value.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <value.icon className={value.color.split(' ')[1]} size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Contact / Location Strip */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="bg-slate-900 rounded-3xl p-8 lg:p-16 text-white overflow-hidden relative">
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="lg:w-1/2">
                                <h2 className="text-3xl lg:text-5xl font-bold mb-6 font-serif">Let's create something <br /> beautiful together.</h2>
                                <p className="text-slate-300 text-lg mb-8">
                                    Our team is ready to help you plan the perfect event. Reach out to us for a consultation or visit our office.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                        <div className="bg-amber-500 p-3 rounded-full text-slate-900">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Visit Us</p>
                                            <p className="font-medium">Prayagraj , Uttar Pradesh ,India</p>
                                        </div>
                                    </div>
                                    <Link to="mailto:support@todaymydream.com" className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors">
                                        <div className="bg-slate-800 p-3 rounded-full text-white border border-slate-600">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Email Us</p>
                                            <p className="font-medium">support@todaymydream.com</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            <div className="lg:w-1/3 flex justify-center lg:justify-end">
                                <Link to="/contact" className="group relative px-8 py-20 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/50">
                                    <div className="text-center">
                                        <span className="block text-slate-900 font-bold text-xl mb-2">Get in Touch</span>
                                        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;