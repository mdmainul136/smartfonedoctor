import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "plus.unsplash.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/compiler-runtime': 'react-compiler-runtime',
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
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
            key: 'Link',
            value: '</.well-known/ard.json>; rel="ard", </api/openapi.json>; rel="service-desc"; type="application/openapi+json", </llms.txt>; rel="describedby"; type="text/markdown"',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/ard.json',
        destination: '/api/ard',
      },
      {
        source: '/.well-known/mcp/server-card.json',
        destination: '/api/mcp-server-card',
      },
      {
        source: '/.well-known/agent-card.json',
        destination: '/api/agent-card',
      },
      {
        source: '/.well-known/agent.json',
        destination: '/api/agent-card',
      },
      {
        // "/:path*.md" does not capture the path, so every .md URL served the homepage.
        source: '/:mdPath(.*)\\.md',
        destination: '/api/markdown?path=:mdPath',
      },
    ];
  },
};

export default withPayload(nextConfig);
