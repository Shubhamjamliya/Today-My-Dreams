import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, RefreshCw, Lock, ChevronDown } from 'lucide-react';
import config from '../config/config';
import { toast } from 'react-hot-toast';

// A new, subtle SVG background component for a premium feel
const SubtlePattern = () => (
  <div className="absolute inset-0 z-0 opacity-50" style={{ backgroundColor: '#ffffff' }}>
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <pattern id="pattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(1) rotate(0)">
          <rect x="0" y="0" width="100%" height="100%" fill="hsla(0,0%,100%,1)" />
          <path d="M20 0L20 40M0 20L40 20" strokeLinecap="square" strokeWidth="1" stroke="hsla(203, 15%, 88%, 1)" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pattern)" />
    </svg>
  </div>
);


const Policies = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const [policies, setPolicies] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    // Set the first section of the default tab to be open initially
    setExpandedSections({ 'terms-0': true });
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch(config.API_URLS.DATA);
      if (response.ok) {
        const data = await response.json();
        const policiesMap = data.reduce((acc, policy) => {
          if (policy.type) acc[policy.type] = policy;
          return acc;
        }, {});
        setPolicies(policiesMap);
      } else {
        toast.error('Failed to load policies.');
      }
    } catch (error) {
      toast.error('An error occurred while fetching policies.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={18} /> },
    { id: 'refund', label: 'Refund Policy', icon: <RefreshCw size={18} /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <Lock size={18} /> }
  ];

  const renderContent = (content) => {
    if (!content) return null;

    // Replace placeholder/old brand names with current brand
    content = content
      .replace(/decoryy/gi, "Today My Dream")
      .replace(/RikoCraft/gi, "Today My Dream")
      .replace(/rikocraft\.com/gi, "todaymydream.com")
      .replace(/call our customer service\./gi, "call our customer service at +91 7860111185.");

    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.endsWith(':') && trimmedLine.length < 100 && trimmedLine.length > 3) {
        if (currentSection) sections.push(currentSection);
        currentSection = { header: trimmedLine.slice(0, -1), content: [] };
      } else if (currentSection && trimmedLine) {
        currentSection.content.push(trimmedLine);
      } else if (!currentSection && trimmedLine) {
        currentSection = { header: 'Overview', content: [trimmedLine] };
      }
    });
    if (currentSection) sections.push(currentSection);

    if (sections.length === 0) {
      return (
        <div className="prose max-w-none text-slate-600">
          {content.split('\n').filter(line => line.trim()).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      );
    }

    return sections.map((section, index) => {
      const sectionId = `${activeTab}-${index}`;
      const isExpanded = !!expandedSections[sectionId];

      return (
        <div key={index} className="border-b border-stone-200 last:border-b-0">
          <button
            onClick={() => toggleSection(sectionId)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-stone-50 transition-colors duration-200"
          >
            <h3 className="text-lg font-medium text-slate-800">{section.header}</h3>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={20} className="text-slate-500" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-2">
                  <div className="prose max-w-none text-slate-600 leading-relaxed">
                    {section.content.map((line, lineIndex) => (
                      <p key={lineIndex}>{line}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-2.5 h-2.5 bg-slate-500 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-2.5 h-2.5 bg-slate-500 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.div
            className="w-2.5 h-2.5 bg-slate-500 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </div>
      </div>
    );
  }

  const hasPolicies = Object.keys(policies).length > 0;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-800">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-white pt-4 pb-4 overflow-hidden"
      >
        <SubtlePattern />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-md border border-stone-200"
          >
            <Shield size={36} className="text-amber-500" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Legal & Policies
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your trust is important to us. Here you'll find transparent information about our terms, refunds, and privacy practices.
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-4">
        {!hasPolicies ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-sm p-12 border border-stone-200">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={32} className="text-slate-500" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-3">No Policies Available</h2>
              <p className="text-slate-500">
                The policy content has not been set up yet. Please check back later or contact the administrator.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center border-b border-stone-200 mb-12"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
                >
                  <span className={activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}>
                    {tab.icon}
                  </span>
                  <span className={activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-amber-500"
                      layoutId="underline"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {policies[activeTab] ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                    {renderContent(policies[activeTab].content)}
                  </div>
                ) : (
                  <div className="text-center bg-white rounded-2xl shadow-sm p-12 border border-stone-200">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      {tabs.find(tab => tab.id === activeTab)?.label}
                    </h3>
                    <p className="text-slate-500">This policy is not yet available.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Policies;