import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';
import { useCity } from '../context/CityContext';

// --- You should have this ProductCard component in its own file ---
// For this example, I'm assuming it's at: '../components/ProductCard'
import ProductCard from '../components/ProductCard/ProductCard';
import { ArrowRight } from 'lucide-react';

// --- This is the new component for each category section ---
const CategoryProductGrid = ({ category, selectedCity }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductsForCategory = async () => {
            if (!category || !category.name) {
                console.warn('CatCard: Invalid category', category);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Request products for this category using backend query params
                const urlParams = new URLSearchParams();
                urlParams.append('category', category.name); // Don't encode, let axios handle it
                urlParams.append('limit', '5'); // Fetch only 5 products per category
                if (selectedCity) {
                    urlParams.append('city', selectedCity);
                }

                const response = await axios.get(`${config.API_URLS.SHOP}?${urlParams.toString()}`);

                // Backend returns an array of products. But some endpoints historically returned { products: [...] }
                const data = response.data || [];
                const productsArray = Array.isArray(data) ? data : (Array.isArray(data.products) ? data.products : []);

                setProducts(productsArray); // Show all products, no slicing

            } catch (error) {
                setProducts([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchProductsForCategory();
    }, [category, selectedCity]);
    // Don't render the section if there are no products for this category
    if (!loading && products.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Section Header */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">{category.name}</h2>
                <Link
                    to="/shop"
                    state={{ selectedCategory: { main: category.name } }}
                    className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors group"
                >
                    View All
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* Product Grid - 2x2 grid on mobile, grid on desktop */}
            <div className="md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-6">
                {/* Mobile: 2x2 grid layout (2 products per row, 2 rows) */}
                <div className="md:hidden grid grid-cols-2 gap-4">
                    {loading ? (
                        // Skeleton loaders while products for this category are fetching
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg aspect-square animate-pulse"></div>
                        ))
                    ) : (
                        products.slice(0, 4).map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    )}
                </div>

                {/* Desktop: Grid layout */}
                <div className="hidden md:contents">
                    {loading ? (
                        // Skeleton loaders while products for this category are fetching
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg aspect-square animate-pulse"></div>
                        ))
                    ) : (
                        products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- This is the main component that fetches all categories ---
const CatCard = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { selectedCity } = useCity();

    useEffect(() => {
        const fetchAllCategories = async () => {
            setLoading(true);
            try {
                // This should be your API endpoint for fetching all categories
                const urlParams = new URLSearchParams();
                if (selectedCity) {
                    urlParams.append('city', selectedCity);
                }

                const response = await axios.get(`${config.API_URLS.CATEGORIES}?${urlParams.toString()}`);
                const fetchedCategories = response.data.categories || response.data || [];

                setCategories(fetchedCategories);
            } catch (error) {
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllCategories();
    }, [selectedCity]);

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-gray-600">
                            No categories available for the selected city.
                            Please select a different city or contact admin to add content.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className=" py-12 sm:py-16" >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-12 md:space-y-16">
                    {categories.map(category => (
                        <CategoryProductGrid
                            key={category._id || category.id}
                            category={category}
                            selectedCity={selectedCity}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CatCard;