// SEO Configuration for Decoryy - Celebration & Decoration Materials
import { slugify } from '../utils/slugify';

export const seoConfig = {
  home: {
    title: "Decoryy - Birthday, Wedding & Anniversary Decoration Materials",
    description: "Shop premium birthday, wedding, and anniversary decoration materials at Decoryy. Balloons, banners, lights, party props, and celebration supplies for every special event.",
    keywords: "birthday decoration, wedding decoration, anniversary decoration, party supplies, balloons, banners, event decor, celebration materials, party props, decoration materials",
    url: "https://decoryy.com/",
    image: "/logo.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Decoryy",
      "alternateName": ["Decoryy Decoration", "Celebration Materials", "Party Supplies"],
      "url": "https://decoryy.com",
      "description": "Premium decoration materials and celebration supplies for birthdays, weddings, anniversaries, and all special events.",
      "brand": {
        "@type": "Brand",
        "name": "Decoryy",
        "alternateName": "Decoryy",
        "logo": "https://decoryy.com/logo.png",
        "slogan": "Celebration Made Beautiful with Decoryy"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://decoryy.com/shop?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },

  shop: {
    title: "Shop Decoration Materials - Birthday, Wedding & Anniversary Supplies",
    description: "Browse our premium collection of decoration materials for birthdays, weddings, anniversaries, and celebrations. Balloons, banners, lights, and party props.",
    keywords: "decoration materials shop, birthday decoration supplies, wedding decor materials, anniversary celebration items, party balloons, banners, lights, celebration props",
    url: "https://decoryy.com/shop",
    image: "/logo.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Decoryy Decoration Materials",
      "description": "Shop decoration materials for birthdays, weddings, anniversaries and celebrations.",
      "url": "https://decoryy.com/shop"
    }
  },

  about: {
    title: "About Decoryy - Premium Decoration Materials & Celebration Supplies",
    description: "Learn about Decoryy's mission to provide premium decoration materials for birthdays, weddings, anniversaries, and celebrations. Quality supplies for every special moment.",
    keywords: "about decoryy, decoration materials company, celebration supplies story, birthday decoration experts, wedding decor materials, anniversary celebration items",
    url: "https://decoryy.com/about",
    image: "/about.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Decoryy",
      "description": "Our story and mission in providing premium decoration materials for birthdays, weddings, anniversaries and celebrations."
    }
  },

  contact: {
    title: "Contact Decoryy - Get Decoration Materials & Celebration Supplies",
    description: "Contact Decoryy for decoration materials, celebration supplies, and customer support. Get help with birthday, wedding, and anniversary decoration needs.",
    keywords: "contact decoryy, decoration materials support, celebration supplies help, birthday decoration inquiry, wedding decor contact, anniversary supplies support",
    url: "https://decoryy.com/contact",
    image: "/logo.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Decoryy",
      "description": "Reach out to us for decoration materials and celebration supplies inquiries."
    }
  },

  product: (product) => ({
    title: `${product.name} - Decoration Materials | Decoryy`,
    description: product.description || `Shop this ${product.name} decoration material for birthdays, weddings, anniversaries, and celebrations at Decoryy.`,
    keywords: `${product.name}, decoration materials, birthday decoration supplies, wedding decor items, anniversary celebration materials, party supplies, celebration props`,
    url: `https://decoryy.com/product/${product._id || product.id}`,
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
        "name": "Decoryy"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "INR",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": `https://decoryy.com/product/${product._id || product.id}`
      }
    }
  }),

  login: {
    title: "Login to Decoryy | Manage Your Decoration Materials Orders",
    description: "Login to your Decoryy account to shop, track, and manage your decoration materials orders for birthdays, weddings, anniversaries, and celebrations.",
    keywords: "login, decoryy account, user login, decoration materials login, celebration supplies account",
    url: "https://decoryy.com/login",
    image: "/logo.png"
  },

  signup: {
    title: "Sign Up for Decoryy | Shop Decoration Materials",
    description: "Create your Decoryy account to shop premium decoration materials and celebration supplies for birthdays, weddings, anniversaries, and special events.",
    keywords: "sign up, decoration materials shopping, birthday decoration signup, celebration supplies registration",
    url: "https://decoryy.com/signup",
    image: "/logo.png"
  },

  policies: {
    title: "Policies & Terms | Decoryy Decoration Materials",
    description: "Read Decoryy's policies, terms of service, privacy policy, and shopping information for decoration materials and celebration supplies.",
    keywords: "policies, terms of service, privacy policy, decoration materials shopping policy, refund policy",
    url: "https://decoryy.com/policies",
    image: "/logo.png"
  },

  seller: {
    title: "Become a Partner | Decoryy Decoration Materials",
    description: "Partner with Decoryy to sell decoration materials and celebration supplies for birthdays, weddings, anniversaries, and events. Grow your business with us.",
    keywords: "become seller, decoration materials partner, join decoryy, celebration supplies partner, decoration business opportunities",
    url: "https://decoryy.com/seller",
    image: "/seller.png"
  },

  blog: {
    title: "Birthday, Anniversary & Baby Shower Decoration Blog - DECORYY",
    description: "Expert tips and inspiration for birthday decorations, anniversary celebrations, baby shower themes, and venue decoration ideas. Transform your special events with our comprehensive decoration guides and DIY tutorials.",
    keywords: "birthday decoration ideas, anniversary decoration, baby shower decoration, venue decoration, party decoration tips, celebration ideas, DIY decoration, event planning, balloon decoration, party themes, decoration trends, party supplies, celebration materials, birthday party ideas, wedding decoration, anniversary party, baby shower themes, venue styling, party planning, decoration inspiration",
    url: "https://decoryy.com/blog",
    image: "/blog-hero.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Decoryy Decoration Blog",
      "description": "Expert tips and inspiration for birthday decorations, anniversary celebrations, baby shower themes, and venue decoration ideas.",
      "url": "https://decoryy.com/blog",
      "publisher": {
        "@type": "Organization",
        "name": "Decoryy",
        "logo": {
          "@type": "ImageObject",
          "url": "https://decoryy.com/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://decoryy.com/blog"
      },
      "inLanguage": "en-US",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://decoryy.com/blog?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },

  app: {
    title: "Download Decoryy App - Shop Decoration Materials on the Go",
    description: "Download the Decoryy app for the best shopping experience. Get exclusive offers, track orders, and shop for birthday, wedding, and anniversary decoration materials anytime, anywhere.",
    keywords: "decoryy app, download decoryy, decoration shopping app, party supplies app, buy decorations online app, android app",
    url: "https://decoryy.com/app",
    image: "/logo.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Decoryy",
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
  title: "Decoryy - Premium Decoration Materials & Celebration Supplies",
  description: "Shop premium decoration materials for birthdays, weddings, anniversaries, and celebrations. Balloons, banners, lights, and party props for every special moment.",
  keywords: "decoration materials, birthday decoration, wedding decor, anniversary celebration, party supplies, celebration materials",
  url: "https://decoryy.com",
  image: "/logo.png"
};
