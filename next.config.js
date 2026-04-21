const path = require('path');

/** @type {import('next').NextConfig} */
const contentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  img-src 'self' data: https:;
  font-src 'self' data:;
  style-src 'self' 'unsafe-inline';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.perplexity.ai https://api.stripe.com https://*.supabase.co;
  frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com;
  form-action 'self' https://checkout.stripe.com;
  upgrade-insecure-requests;
`
  .replace(/\n/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim();

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      {
        source: '/ressources/geo-visibilite-ia-guide',
        destination: '/ressources/quest-ce-que-le-geo',
        permanent: true,
      },
      {
        source: '/blog/quest-ce-que-le-geo',
        destination: '/ressources/quest-ce-que-le-geo',
        permanent: true,
      },
      {
        source: '/blog/seo-vs-geo-difference',
        destination: '/ressources/seo-vs-geo',
        permanent: true,
      },
      {
        source: '/seo-vs-geo',
        destination: '/ressources/seo-vs-geo',
        permanent: true,
      },
      {
        source: '/comment-savoir-si-chatgpt-cite-votre-site',
        destination: '/ressources/comment-savoir-si-chatgpt-cite-votre-site',
        permanent: true,
      },
      {
        source: '/presence-google-ai-overviews',
        destination: '/audit-visibilite-ia',
        permanent: true,
      },
      {
        source: '/chatgpt-cite-mon-site',
        destination: '/presence-chatgpt',
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
