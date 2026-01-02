import React from 'react';
import { Link } from 'react-router-dom';

const InternalLinking = ({
  type = 'general',
  currentPage = '',
  category = null,
  product = null
}) => {
  // Define internal linking strategies based on page type
  const getInternalLinks = () => {
    const baseLinks = {
      general: [
        { to: '/blog', text: 'Decoration Ideas & Tips', description: 'Expert decoration guides and inspiration' },
        { to: '/shop', text: 'Shop Decoration Materials', description: 'Browse our complete collection' },
        { to: '/venues', text: 'Venue Decoration Services', description: 'Professional event styling' },
        { to: '/about', text: 'About TodayMyDream', description: 'Learn about our mission' }
      ],
      product: [
        { to: '/blog', text: 'Related Decoration Ideas', description: 'Get inspired with our blog posts' },
        { to: '/shop', text: 'Similar Products', description: 'Explore more decoration materials' },
        { to: '/venues', text: 'Professional Decoration Services', description: 'Let us style your venue' }
      ],
      blog: [
        { to: '/shop', text: 'Shop Featured Products', description: 'Buy the decoration materials mentioned' },
        { to: '/venues', text: 'Venue Decoration Services', description: 'Professional event styling' },
        { to: '/blog', text: 'More Decoration Ideas', description: 'Explore our blog for more inspiration' }
      ],
      category: [
        { to: '/blog', text: `${category} Decoration Ideas`, description: `Expert tips for ${category} decorations` },
        { to: '/shop', text: 'All Decoration Materials', description: 'Browse our complete collection' },
        { to: '/venues', text: 'Professional Decoration Services', description: 'Let us style your venue' }
      ]
    };

    return baseLinks[type] || baseLinks.general;
  };

  // Get contextual links based on current page
  const getContextualLinks = () => {
    if (type === 'product' && product) {
      return [
        { to: `/shop?category=${product.category?.name}`, text: `More ${product.category?.name} Items`, description: 'Explore similar products' },
        { to: '/blog', text: `${product.category?.name} Decoration Ideas`, description: 'Get inspired with our guides' }
      ];
    }

    if (type === 'blog' && category) {
      return [
        { to: `/shop?category=${category}`, text: `Shop ${category} Materials`, description: 'Buy the materials mentioned' },
        { to: '/blog', text: 'More Decoration Ideas', description: 'Explore our complete blog' }
      ];
    }

    return [];
  };

  const internalLinks = [...getInternalLinks(), ...getContextualLinks()];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 my-8">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Explore More</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {internalLinks.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className="group bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200"
          >
            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
              {link.text}
            </h4>
            <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">
              {link.description}
            </p>
            <div className="mt-3 flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
              <span className="text-sm font-medium">Learn More</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Breadcrumb component for better navigation and SEO
export const Breadcrumb = ({ items = [] }) => {
  const defaultItems = [
    { name: 'Home', href: '/' },
    ...items
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6" aria-label="Breadcrumb">
      {defaultItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-blue-600 transition-colors"
            >
              {item.name}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Related content component
export const RelatedContent = ({
  type,
  items = [],
  title = "Related Content",
  maxItems = 3
}) => {
  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, maxItems);

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {item.image && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-slate-600 line-clamp-3">
                  {item.description}
                </p>
              )}
              {item.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {item.category}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default InternalLinking;
