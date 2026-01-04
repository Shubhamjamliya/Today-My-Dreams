// File: admin/src/components/SidebarLayout.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  Users,
  LogOut,
  Tag,
  Store,
  Menu,
  X,
  Presentation,
  File,
  Settings,
  BookOpen,
  Gift,
  Video
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState(['shop']); // Shop open by default

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMenu = (label) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const menuItems = [
    { path: '/admin', icon: <ShoppingBag size={20} />, label: 'Dashboard' },
    {
      label: 'Shop',
      icon: <Store size={20} />,
      children: [
        { path: '/admin/shop/categories', label: 'Manage Category' },
        { path: '/admin/shop/subcategories', label: 'Manage Subcategory' },
        { path: '/admin/shop/products', label: 'Manage Products' },
        { path: '/admin/shop/orders', label: 'Manage Orders' },
      ]
    },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
    { path: '/admin/addons', icon: <Gift size={20} />, label: 'Add-ons' },
    { path: '/admin/hero-carousel', icon: <Presentation size={20} />, label: 'all slider' },
    { path: '/admin/categories', icon: <Tag size={20} />, label: 'Categories' },
    { path: '/admin/videos', icon: <Video size={20} />, label: 'Videos' },
    { path: '/admin/orders', icon: <Users size={20} />, label: 'Orders' },
    { path: '/admin/data', icon: <File size={20} />, label: 'Data' },
    { path: '/admin/coupons', icon: <Users size={20} />, label: 'Coupons' },
    { path: '/admin/cities', icon: <Users size={20} />, label: 'City' },
    { path: '/admin/blog', icon: <BookOpen size={20} />, label: 'Blog' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <style>
        {`
          .sidebar-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .sidebar-scrollbar::-webkit-scrollbar-track {
            background: #0f172a;
          }
          .sidebar-scrollbar::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 10px;
          }
          .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #FCD24C;
          }
          .sidebar-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #1e293b #0f172a;
          }
        `}
      </style>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="relative border-b-2 border-slate-800 bg-slate-950/50">
            <Link to="/admin" className="block w-full">
              <div className="flex items-center justify-center p-4">
                <img
                  src="/TodayMyDream.png"
                  alt="Today My Dream Logo"
                  className="w-full h-auto max-h-24 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="pb-4 text-center">
              <p className="text-xs font-bold tracking-[0.2em] text-[#FCD24C] uppercase opacity-80">Admin Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto sidebar-scrollbar">
            {menuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isMenuOpen = openMenus.includes(item.label);

              if (hasChildren) {
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`
                        flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group
                        ${isMenuOpen ? 'text-[#FCD24C]' : 'text-slate-400 hover:bg-slate-800 hover:text-[#FCD24C]'}
                      `}
                    >
                      <div className={`${isMenuOpen ? 'text-[#FCD24C]' : 'text-slate-500 group-hover:text-[#FCD24C]'}`}>
                        {item.icon}
                      </div>
                      <span className="ml-3 font-medium">{item.label}</span>
                      <div className="ml-auto">
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {isMenuOpen && (
                      <div className="ml-9 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                              flex items-center px-4 py-2 rounded-lg transition-all duration-200
                              ${isActive(child.path)
                                ? 'bg-slate-800 text-[#FCD24C] font-bold'
                                : 'text-slate-500 hover:text-[#FCD24C] hover:bg-slate-800/50'
                              }
                            `}
                          >
                            <span className="text-sm font-medium">{child.label}</span>
                            {isActive(child.path) && (
                              <div className="ml-auto w-1.5 h-1.5 bg-[#FCD24C] rounded-full"></div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive(item.path)
                      ? 'bg-[#FCD24C] text-slate-900 shadow-lg font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-[#FCD24C] hover:shadow-sm'
                    }
                  `}
                >
                  <div className={`
                    ${isActive(item.path) ? 'text-slate-900' : 'text-slate-500 group-hover:text-[#FCD24C]'}
                  `}>
                    {item.icon}
                  </div>
                  <span className="ml-3 font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-slate-900 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 group shadow-md hover:shadow-lg"
            >
              <LogOut size={20} className="text-white" />
              <span className="ml-3 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 shadow-sm border-b border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Menu size={20} className="text-white" />
            </button>
            <Link to="/admin">
              <div className="flex items-center space-x-2">

                <img src="/TodayMyDream.png" alt="Today My Dream Logo" className="w-10 h-10 object-contain" />
                <span className="text-lg font-bold text-white">Today My Dream</span>

              </div>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
