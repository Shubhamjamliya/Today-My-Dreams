import React, { Suspense, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import { Home, ShoppingCart, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { useVendorAuth } from '../context/VendorAuthContext';

const VendorSidebarLink = ({ to, active, children, icon }) => (
  <Link
    to={to}
    className={`
      flex items-center px-4 py-3 rounded-xl transition-all duration-200 group mb-1
      ${active
        ? 'bg-[#FCD24C] text-slate-900 shadow-lg font-bold'
        : 'text-slate-400 hover:bg-slate-800 hover:text-[#FCD24C] hover:shadow-sm'
      }
    `}
  >
    <div className={`
      ${active ? 'text-slate-900' : 'text-slate-500 group-hover:text-[#FCD24C]'}
    `}>
      {icon}
    </div>
    <span className="ml-3 font-medium">{children}</span>
    {active && (
      <div className="ml-auto w-2 h-2 bg-slate-900 rounded-full"></div>
    )}
  </Link>
);

const VendorLayout = () => {
  const { pathname } = useLocation();
  const { logout, vendor } = useVendorAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (key) =>
    pathname === '/vendor' ? key === 'dashboard' : pathname.includes(key);

  const handleLogout = () => {
    logout();
    // Context handles redirection or state update
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="relative border-b-2 border-slate-800 bg-slate-950/50">
            <Link to="/vendor/dashboard" className="block w-full" onClick={() => setIsSidebarOpen(false)}>
              <div className="flex items-center justify-center p-4">
                <img
                  src="/TodayMyDream.png"
                  alt="Today My Dream Logo"
                  className="w-full h-auto max-h-24 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <div className="pb-4 text-center">
              <p className="text-xs font-bold tracking-[0.2em] text-[#FCD24C] uppercase opacity-80">Vendor Portal</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <VendorSidebarLink to="/vendor/dashboard" active={isActive('dashboard')} icon={<Home size={20} />} onClick={() => setIsSidebarOpen(false)}>
              Dashboard
            </VendorSidebarLink>
            <VendorSidebarLink to="/vendor/orders" active={isActive('orders')} icon={<ShoppingCart size={20} />} onClick={() => setIsSidebarOpen(false)}>
              Orders
            </VendorSidebarLink>
            <VendorSidebarLink to="/vendor/settings" active={isActive('settings')} icon={<Settings size={20} />} onClick={() => setIsSidebarOpen(false)}>
              Settings
            </VendorSidebarLink>
            <VendorSidebarLink to="/vendor/profile" active={isActive('profile')} icon={<User size={20} />} onClick={() => setIsSidebarOpen(false)}>
              Profile
            </VendorSidebarLink>
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 shadow-xl border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            {/* Hamburger button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-white hover:bg-slate-800 p-2 rounded-md transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link to="/vendor/dashboard" className="flex items-center space-x-3">
              <img
                src="/TodayMyDream.png"
                alt="Today My Dream"
                className="w-8 h-8 object-contain"
              />
              <div>
                <span className="text-lg font-bold text-white block leading-none">Today My Dream</span>
                <span className="text-[10px] text-[#FCD24C] font-bold tracking-widest uppercase opacity-90">Vendor Portal</span>
              </div>
            </Link>

            {vendor && (
              <Link to="/vendor/profile" className="flex items-center space-x-2 bg-slate-800 py-1.5 px-3 rounded-full border border-slate-700">
                <div className="relative">
                  <User size={14} className="text-[#FCD24C]" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-800"></span>
                </div>
                <span className="text-xs font-medium text-slate-200 max-w-[80px] truncate">{vendor.name?.split(' ')[0]}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Bottom Nav (Unchanged) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-4">
            <Link to="/vendor/dashboard" className={`flex flex-col items-center py-2 ${isActive('dashboard') ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <Home size={24} strokeWidth={isActive('dashboard') ? 2.5 : 2} className={isActive('dashboard') ? 'text-[#FCD24C] fill-slate-900' : ''} />
              <span className={`text-[10px] mt-1 font-medium ${isActive('dashboard') ? 'text-slate-900' : ''}`}>Home</span>
            </Link>
            <Link to="/vendor/orders" className={`flex flex-col items-center py-2 ${isActive('orders') ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <ShoppingCart size={24} strokeWidth={isActive('orders') ? 2.5 : 2} className={isActive('orders') ? 'text-[#FCD24C] fill-slate-900' : ''} />
              <span className={`text-[10px] mt-1 font-medium ${isActive('orders') ? 'text-slate-900' : ''}`}>Orders</span>
            </Link>
            <Link to="/vendor/settings" className={`flex flex-col items-center py-2 ${isActive('settings') ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <Settings size={24} strokeWidth={isActive('settings') ? 2.5 : 2} className={isActive('settings') ? 'text-[#FCD24C] fill-slate-900' : ''} />
              <span className={`text-[10px] mt-1 font-medium ${isActive('settings') ? 'text-slate-900' : ''}`}>Settings</span>
            </Link>
            <Link to="/vendor/profile" className={`flex flex-col items-center py-2 ${isActive('profile') ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <User size={24} strokeWidth={isActive('profile') ? 2.5 : 2} className={isActive('profile') ? 'text-[#FCD24C] fill-slate-900' : ''} />
              <span className={`text-[10px] mt-1 font-medium ${isActive('profile') ? 'text-slate-900' : ''}`}>Profile</span>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50/50">
          <div className="p-4 pb-24 md:p-6 md:pb-6">
            <Suspense fallback={<Loader size="md" text="Loading..." />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;

