import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, Tag, Layers, Package, ShoppingCart, Plus, ArrowRight } from 'lucide-react';
import apiService from '../services/api';
import Loader from "../components/Loader";

const ShopDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopStats = async () => {
      try {
        setLoading(true);
        // In a production app, we'd have a specific stats endpoint or filter here
        const productsRes = await apiService.getProducts();
        const categoriesRes = await apiService.getCategories();
        const ordersRes = await apiService.getOrders();

        const shopProducts = (productsRes.data.products || productsRes.data || []).filter(p => p.module === 'shop');
        const shopCategories = (categoriesRes.data.categories || categoriesRes.data || []).filter(c => c.module === 'shop');
        const shopOrders = (ordersRes.data.orders || ordersRes.data || []).filter(o =>
          o.items && o.items.some(item => item.module === 'shop')
        );

        setStats({
          totalProducts: shopProducts.length,
          totalCategories: shopCategories.length,
          totalOrders: shopOrders.length
        });
      } catch (err) {
        console.error("Failed to fetch shop stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopStats();
  }, []);

  const ActionCard = ({ title, description, icon, link, color, count }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className={`h-2 ${color}`}></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-slate-50 text-slate-600 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {count !== undefined && (
            <span className="text-2xl font-bold text-slate-800">{count}</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-500 text-sm mb-6">{description}</p>
        <div className="flex gap-2">
          <Link
            to={link}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Manage
          </Link>
          <Link
            to={`${link}${link.includes('products') ? '/edit/new?module=shop' : '/edit/new?module=shop'}`}
            className="inline-flex items-center justify-center p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            title={`Add New ${title}`}
          >
            <Plus size={20} />
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-10 flex justify-center"><Loader /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shop Management</h1>
          <p className="text-slate-500 mt-1">Control your luxury shop inventory and orders from one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-slate-700">Shop Module Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          title="Categories"
          description="Jewellery, Shoes, Apparel, etc."
          icon={<Tag size={24} />}
          link="/admin/shop/categories"
          color="bg-amber-500"
          count={stats.totalCategories}
        />
        <ActionCard
          title="Subcategories"
          description="Necklaces, Earrings, High Heels."
          icon={<Layers size={24} />}
          link="/admin/shop/subcategories"
          color="bg-blue-500"
        />
        <ActionCard
          title="Products"
          description="Detailed product cards and stock."
          icon={<Package size={24} />}
          link="/admin/shop/products"
          color="bg-purple-500"
          count={stats.totalProducts}
        />
        <ActionCard
          title="Shop Orders"
          description="Track and manage shop sales."
          icon={<ShoppingCart size={24} />}
          link="/admin/shop/orders"
          color="bg-emerald-500"
          count={stats.totalOrders}
        />
      </div>

      {/* Quick Summary / Charts Placeholder or Recent Updates */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Launch New Collections</h2>
            <p className="text-slate-300 mb-8 max-w-md">Ready to add something special to TodayMyDream? Start by creating a category and adding your first premium product.</p>
            <Link
              to="/admin/shop/products/edit/new?module=shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-xl font-bold hover:bg-amber-400 transition-all"
            >
              Quick Add Product <ArrowRight size={20} />
            </Link>
          </div>
          {/* Abstract Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-12 opacity-10">
            <Store size={200} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
            <Store size={20} className="text-amber-500" /> Shop Status
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 text-sm font-medium">Auto-Categorization</span>
              <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-md">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 text-sm font-medium">Inventory Alerts</span>
              <span className="text-amber-600 text-sm font-bold bg-amber-50 px-2 py-1 rounded-md">3 Low Stock</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-500 text-sm font-medium">Module Mode</span>
              <span className="text-blue-600 text-sm font-bold bg-blue-50 px-2 py-1 rounded-md">Multi-Vendor Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;
