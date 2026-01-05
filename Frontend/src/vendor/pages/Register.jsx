import React, { useState } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Phone, MapPin, Layers } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useVendorAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', cityText: '', categoryText: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState({ aadharCard: null, panCard: null });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (files.aadharCard) formData.append('aadharCard', files.aadharCard);
    if (files.panCard) formData.append('panCard', files.panCard);

    const res = await register(formData);
    setMessage(res.message || (res.success ? 'Registered successfully. Await approval.' : 'Failed'));
    setLoading(false);

    if (res.success) {
      setTimeout(() => {
        navigate('/vendor/login');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[85vh]">

        {/* Left Side: Branding & Info - Hidden on Mobile */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#FCD24C] to-[#F59E0B] p-12 flex-col justify-between relative overflow-hidden text-slate-900">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <img src="/TodayMyDream.png" alt="Logo" className="w-16 h-16 object-contain bg-white/20 rounded-xl p-2 backdrop-blur-sm" />
              <span className="text-xl font-bold tracking-tight">Today My Dream</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
              Grow your business with us
            </h1>
            <p className="text-lg text-slate-800/80 mb-8 font-medium">
              Join our network of trusted vendors and reach thousands of customers planning their dream events in your city.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Zero listing fees',
                'Direct customer leads',
                'Easy booking management',
                'Secure payments'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-slate-900/90">
                  <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 text-xs font-semibold uppercase tracking-widest opacity-60 mt-8 lg:mt-0">
            Partner Portal
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full lg:w-3/5 bg-white relative">
          <div className="h-full overflow-y-auto p-6 md:p-8 lg:p-12 custom-scrollbar">

            {/* Mobile Header - Visible only on Mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4 bg-amber-100 p-4 rounded-full shadow-sm">
                <img src="/TodayMyDream.png" alt="Logo" className="w-16 h-16 object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Partner Registration</h2>
              <p className="text-slate-500 text-sm mt-1">Create your vendor account today</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <h2 className="hidden lg:block text-2xl font-bold text-slate-900 mb-2">Create Partner Account</h2>
              <p className="hidden lg:block text-slate-500 mb-8">Fill in your details to start your journey.</p>

              <form onSubmit={onSubmit} className="space-y-6">
                {message && (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${message.toLowerCase().includes('fail') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    <span className="text-sm font-medium pt-0.5">{message}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Business / Owner Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input name="name" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Royal Events" value={form.name} onChange={onChange} required />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input name="email" type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400" placeholder="name@business.com" value={form.email} onChange={onChange} required />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input name="phone" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400" placeholder="+91 98765 43210" value={form.phone} onChange={onChange} required />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input name="password" type="password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400" placeholder="Create robust password" value={form.password} onChange={onChange} required />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input name="cityText" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400" placeholder="Your operating city" value={form.cityText} onChange={onChange} required />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Category</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input name="categoryText" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FCD24C] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Decoration, Catering" value={form.categoryText} onChange={onChange} required />
                    </div>
                  </div>

                </div>

                {/* Documents Section */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Verification Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Aadhar Card</label>
                      <input type="file" name="aadharCard" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#FCD24C]/20 file:text-amber-700 hover:file:bg-[#FCD24C]/30 cursor-pointer border border-slate-200 rounded-xl" accept="image/*,application/pdf" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">PAN Card</label>
                      <input type="file" name="panCard" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#FCD24C]/20 file:text-amber-700 hover:file:bg-[#FCD24C]/30 cursor-pointer border border-slate-200 rounded-xl" accept="image/*,application/pdf" required />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl text-slate-900 font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] ${loading ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-[#FCD24C] hover:bg-[#F59E0B]'}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : 'Register Account'}
                  </button>

                  <p className="text-center mt-6 text-slate-500">
                    Already have a partner account?{' '}
                    <Link to="/vendor/login" className="text-amber-600 font-bold hover:underline">Log In</Link>
                  </p>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only footer simple text */}
      <div className="fixed bottom-4 text-center w-full pointer-events-none lg:hidden">
        <p className="text-white/40 text-xs">Today My Dream Partner Portal</p>
      </div>
    </div>
  );
};

export default Register;
