// SEO Configuration for Today My Dream - Celebration & Decoration Materials
import { slugify } from '../utils/slugify';

export const seoConfig = {
  home: {
    title: "Today My Dream - Birthday, Wedding & Anniversary Decoration Materials",
    description: "Shop premium birthday, wedding, and anniversary decoration materials at Today My Dream. Balloons, banners, lights, party props, and celebration supplies for every special event.",
    keywords: "birthday decoration, wedding decoration, anniversary decoration, party supplies, balloons, banners, event decor, celebration materials, party props, decoration materials",
    url: "https://todaymydream.com/",
    image: "/logo.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Today My Dream",
      "alternateName": ["Today My Dream Decoration", "Celebration Materials", "Party Supplies"],
      "url": "https://todaymydream.com",
      "description": "Premium decoration materials and celebration supplies for birthdays, weddings, anniversaries, and all special events.",
      "brand": {
        "@type": "Brand",
        "name": "Today My Dream",
        "alternateName": "Today My Dream",
        "logo": "https://todaymydream.com/logo.png",
        "slogan": "Celebration Made Beautiful with Today My Dream"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://todaymydream.com/shop?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },

  shop: {
    title: "Shop Decoration Materials - Birthday, Wedding & Anniversary Supplies",
    description: "Browse our premium collection of decoration materials for birthdays, weddings, anniversaries, and celebrations. Balloons, banners, lights, and party props.",
    keywords: "decoration materials shop, birthday decoration supplies, wedding decor materials, anniversary celebration items, party balloons, banners, lights, celebration props",
    url: "https://todaymydream.com/shop",
    image: "/logo.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Today My Dream Decoration Materials",
      "description": "Shop decoration materials for birthdays, weddings, anniversaries and celebrations.",
      "url": "https://todaymydream.com/shop"
    }
  },

  about: {
    title: "About Today My Dream - Premium Decoration Materials & Celebration Supplies",
    description: "Learn about Today My Dream's mission to provide premium decoration materials for birthdays, weddings, anniversaries, and celebrations. Quality supplies for every special moment.",
    keywords: "about today my dream, decoration materials company, celebration supplies story, birthday decoration experts, wedding decor materials, anniversary celebration items",
    url: "https://todaymydream.com/about",
    image: "/about.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Today My Dream",
      "description": "Our story and mission in providing premium decoration materials for birthdays, weddings, anniversaries and celebrations."
    }
  },

  contact: {
    title: "Contact Today My Dream - Get Decoration Materials & Celebration Supplies",
    description: "Contact Today My Dream for decoration materials, celebration supplies, and customer support. Get help with birthday, wedding, and anniversary decoration needs.",
    keywords: "contact today my dream, decoration materials support, celebration supplies help, birthday decoration inquiry, wedding decor contact, anniversary supplies support",
    url: "https://todaymydream.com/contact",
    image: "/logo.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Today My Dream",
      "description": "Reach out to us for decoration materials and celebration supplies inquiries."
    }
  },

  product: (product) => ({
    title: `${product.name} - Decoration Materials | Today My Dream`,
    description: product.description || `Shop this ${product.name} decoration material for birthdays, weddings, anniversaries, and celebrations at Today My Dream.`,
    keywords: `${product.name}, decoration materials, birthday decoration supplies, wedding decor items, anniversary celebration materials, party supplies, celebration props`,
    url: `https://todaymydream.com/product/${product._id || product.id}`,
    image: product.images?.[0] || "/logo.png",
    type: "product",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || `Decoration material: ${product.name}`,
      "image": product.images || ["/logo.png"],
      "brand": {
        "@type": "Brand",
        "name": "Today My Dream"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "INR",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": `https://todaymydream.com/product/${product._id || product.id}`
      }
    }
  }),

  login: {
    title: "Login to Today My Dream | Manage Your Decoration Materials Orders",
    description: "Login to your Today My Dream account to shop, track, and manage your decoration materials orders for birthdays, weddings, anniversaries, and celebrations.",
    keywords: "login, today my dream account, user login, decoration materials login, celebration supplies account",
    url: "https://todaymydream.com/login",
    image: "/logo.png"
  },

  signup: {
    title: "Sign Up for Today My Dream | Shop Decoration Materials",
    description: "Create your Today My Dream account to shop premium decoration materials and celebration supplies for birthdays, weddings, anniversaries, and special events.",
    keywords: "sign up, decoration materials shopping, birthday decoration signup, celebration supplies registration",
    url: "https://todaymydream.com/signup",
    image: "/logo.png"
  },

  policies: {
    title: "Policies & Terms | Today My Dream Decoration Materials",
    description: "Read Today My Dream's policies, terms of service, privacy policy, and shopping information for decoration materials and celebration supplies.",
    keywords: "policies, terms of service, privacy policy, decoration materials shopping policy, refund policy",
    url: "https://todaymydream.com/policies",
    image: "/logo.png"
  },

  seller: {
    title: "Become a Partner | Today My Dream Decoration Materials",
    description: "Partner with Today My Dream to sell decoration materials and celebration supplies for birthdays, weddings, anniversaries, and events. Grow your business with us.",
    keywords: "become seller, decoration materials partner, join today my dream, celebration supplies partner, decoration business opportunities",
    url: "https://todaymydream.com/seller",
    image: "/seller.png"
  },

  blog: {
    title: "Birthday, Anniversary & Baby Shower Decoration Blog - TODAY MY DREAM",
    description: "Expert tips and inspiration for birthday decorations, anniversary celebrations, baby shower themes, and venue decoration ideas. Transform your special events with our comprehensive decoration guides and DIY tutorials.",
    keywords: "birthday decoration ideas, anniversary decoration, baby shower decoration, venue decoration, party decoration tips, celebration ideas, DIY decoration, event planning, balloon decoration, party themes, decoration trends, party supplies, celebration materials, birthday party ideas, wedding decoration, anniversary party, baby shower themes, venue styling, party planning, decoration inspiration",
    url: "https://todaymydream.com/blog",
    image: "/blog-hero.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Today My Dream Decoration Blog",
      "description": "Expert tips and inspiration for birthday decorations, anniversary celebrations, baby shower themes, and venue decoration ideas.",
      "url": "https://todaymydream.com/blog",
      "publisher": {
        "@type": "Organization",
        "name": "Today My Dream",
        "logo": {
          "@type": "ImageObject",
          "url": "https://todaymydream.com/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://todaymydream.com/blog"
      },
      "inLanguage": "en-US",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://todaymydream.com/blog?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },

  app: {
    title: "Download Today My Dream App - Shop Decoration Materials on the Go",
    description: "Download the Today My Dream app for the best shopping experience. Get exclusive offers, track orders, and shop for birthday, wedding, and anniversary decoration materials anytime, anywhere.",
    keywords: "today my dream app, download today my dream, decoration shopping app, party supplies app, buy decorations online app, android app",
    url: "https://todaymydream.com/app",
    image: "/logo.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Today My Dream",
      "applicationCategory": "ShoppingApplication",
      "operatingSystem": "Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      }
    }
  }
};

// Default SEO fallback
export const defaultSEO = {
  title: "Today My Dream - Premium Decoration Materials & Celebration Supplies",
  description: "Shop premium decoration materials for birthdays, weddings, anniversaries, and celebrations. Balloons, banners, lights, and party props for every special moment.",
  keywords: "decoration materials, birthday decoration, wedding decor, anniversary celebration, party supplies, celebration materials",
  url: "https://todaymydream.com",
  image: "/logo.png"
};
