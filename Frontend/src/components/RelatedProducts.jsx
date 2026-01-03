import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';
import ProductCard from './ProductCard/ProductCard';
import { ArrowRight } from 'lucide-react';
import Loader from './Loader'; // Assuming Loader is in the same components directory

const RelatedProducts = ({ currentProduct }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!currentProduct || !currentProduct.category?.name) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Fetch only 20 products (to filter out current and show up to 18)
                const response = await axios.get(
                    `${config.API_URLS.SHOP}?category=${encodeURIComponent(currentProduct.category.name)}&limit=20`,
                    { timeout: 15000 } // 15 second timeout for better reliability
                );
                const allProducts = response.data.products || response.data || [];

                // Filter out the current product and take the first 18
                const filteredProducts = allProducts
                    .filter((product) => product._id !== currentProduct._id)
                    .slice(0, 18);

                setRelatedProducts(filteredProducts);
            } catch (error) {
                // Failed to fetch related products
                setRelatedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [currentProduct]);

    if (loading) {
        return (
            <div className="py-8 flex justify-center">
                <Loader size="large" text="Finding similar products..." />
            </div>
        );
    }

    if (relatedProducts.length === 0) {
        return null; // Don't render if no related products are found
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            className="mt-12"
        >
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">More from {currentProduct.category.name}</h2>
                <Link
                    to="/shop"
                    state={{ selectedCategory: { main: currentProduct.category.name } }}
                    className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group"
                >
                    View All
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                {relatedProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}

            </div>
        </motion.div>
    );
};

export default RelatedProducts;
