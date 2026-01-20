import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = "Karisa Voyani - Mechanical Engineer & Full-Stack Developer",
  description = "Portfolio of Karisa Voyani, a Mechanical Engineer and Full-Stack Developer from Kenya. Specializing in React, Supabase, and engineering-driven web solutions.",
  keywords = "mechanical engineer Kenya, full-stack developer, React developer, Supabase, web development, software engineer Kenya, Nairobi developer, African tech, engineering portfolio",
  image = "https://voyani.tech/og-image.jpg",
  url = "https://voyani.tech",
  type = "website"
}) => {
  const siteTitle = "Karisa Voyani - Portfolio";
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  // Google Search Console verification (add your verification code)
  const googleVerification = import.meta.env.VITE_GOOGLE_VERIFICATION || '';

  // Bing Webmaster Tools verification (optional)
  const bingVerification = import.meta.env.VITE_BING_VERIFICATION || '';

  // Structured Data - Person Schema
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Karisa Voyani",
    "jobTitle": ["Mechanical Engineer", "Full-Stack Developer"],
    "url": "https://voyani.tech",
    "image": image,
    "description": description,
    "nationality": {
      "@type": "Country",
      "name": "Kenya"
    },
    "knowsAbout": [
      "Mechanical Engineering",
      "Web Development",
      "React",
      "JavaScript",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Node.js",
      "CAD",
      "MATLAB",
      "Full-Stack Development",
      "Software Engineering"
    ],
    "sameAs": [
      "https://github.com/voyyani",
      "https://linkedin.com/in/karisa-voyani"
    ]
  };

  // Structured Data - Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Karisa Voyani Portfolio",
    "url": "https://voyani.tech",
    "description": description,
    "author": {
      "@type": "Person",
      "name": "Karisa Voyani"
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Karisa Voyani" />
      <meta name="geo.region" content="KE" />
      <meta name="geo.placename" content="Kenya" />
      
      {/* Search Engine Verification */}
      {googleVerification && <meta name="google-site-verification" content={googleVerification} />}
      {bingVerification && <meta name="msvalidate.01" content={bingVerification} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Karisa Voyani Portfolio" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@karisavoyani" /> {/* Update with actual handle */}

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="theme-color" content="#061220" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
