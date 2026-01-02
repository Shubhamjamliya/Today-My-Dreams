import React from 'react';
import { motion } from 'framer-motion';
import { FaGooglePlay, FaMobileAlt, FaShoppingBag, FaBolt, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AppMockupImage from '../assets/app-mockup.jpg';

const AppDownload = () => {
    const features = [
        {
            icon: <FaMobileAlt className="text-3xl text-primary" />,
            title: "Seamless Experience",
            description: "Enjoy a smooth and intuitive shopping experience optimized for your mobile device."
        },
        {
            icon: <FaBolt className="text-3xl text-primary" />,
            title: "Fast & Secure",
            description: "Lightning fast checkout and secure payment options at your fingertips."
        },
        {
            icon: <FaStar className="text-3xl text-primary" />,
            title: "Exclusive Offers",
            description: "Get access to app-only discounts and early access to sales."
        },
        {
            icon: <FaShoppingBag className="text-3xl text-primary" />,
            title: "Track Orders",
            description: "Real-time tracking of your orders from dispatch to delivery."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-10 overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-1/2 text-center lg:text-left z-10"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold mb-4">
                            Now Available on Android
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Get the <span className="text-primary">TodayMyDream</span> App
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                            Transform your party planning experience. Download our app today for the easiest way to shop for balloons and decorations.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <motion.a
                                href="https://play.google.com/store/apps/details?id=com.app.todaymydream"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:bg-gray-800 transition-colors"
                            >
                                <FaGooglePlay className="text-3xl text-primary" />
                                <div className="text-left">
                                    <div className="text-xs uppercase font-medium text-gray-400">Get it on</div>
                                    <div className="text-xl font-bold leading-none">Google Play</div>
                                </div>
                            </motion.a>
                        </div>
                    </motion.div>

                    {/* Visual/Phone Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:w-1/2 relative flex justify-center"
                    >
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10"></div>

                        {/* Phone Mockup */}
                        <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden">

                            {/* Screen Content */}
                            <div className="w-full h-full bg-white overflow-hidden relative ">
                                <img
                                    src={AppMockupImage}
                                    alt="TodayMyDream App Screenshot"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-20 right-10 bg-white p-3 rounded-2xl shadow-xl z-20"
                        >
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <FaStar className="text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Rating</div>
                                    <div className="font-bold">4.8/5</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-40 left-0 bg-white p-3 rounded-2xl shadow-xl z-20"
                        >
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <FaMobileAlt className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">decorations</div>
                                    <div className="font-bold">1k+</div>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <div className="mb-4 bg-yellow-50 w-14 h-14 rounded-full flex items-center justify-center">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-24 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start shopping?</h2>
                        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                            Download the TodayMyDream app now and get the best party supplies delivered right to your doorstep.
                        </p>
                        <a
                            href="https://play.google.com/store/apps/details?id=com.app.todaymydream"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                        >
                            <FaGooglePlay className="text-xl text-primary" />
                            <span>Download Now</span>
                        </a>
                    </div>
                </motion.div>

            </div>
        </div >
    );
};

export default AppDownload;
