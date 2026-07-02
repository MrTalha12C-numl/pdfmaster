import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    author?: string;
    section?: string;
  };
}

export function SEO({
  title,
  description,
  keywords,
  image = 'https://images.pexels.com/photo-4226140/pexels-photo-4226140.jpeg',
  url,
  type = 'website',
  article,
}: SEOProps) {
  const siteUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullTitle = `${title} | PDF Master`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="PDF Master" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article Specific */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
        </>
      )}

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: fullTitle,
          description,
          url: siteUrl,
          image: {
            '@type': 'ImageObject',
            url: image,
          },
          ...(type === 'article' && article && {
            datePublished: article.publishedTime,
            author: {
              '@type': 'Person',
              name: article.author || 'PDF Master',
            },
            publisher: {
              '@type': 'Organization',
              name: 'PDF Master',
              logo: {
                '@type': 'ImageObject',
                url: 'https://pdfmaster.com/logo.png',
              },
            },
          }),
          ...(type === 'website' && {
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://pdfmaster.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        })}
      </script>
    </Helmet>
  );
}

export function ToolSEO({ toolName, toolDescription }: { toolName: string; toolDescription: string }) {
  return (
    <SEO
      title={`${toolName} - Free Online Tool`}
      description={toolDescription}
      keywords={`${toolName.toLowerCase()}, PDF tool, free PDF, online PDF, ${toolName.toLowerCase()} free`}
      type="website"
    />
  );
}
