import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async rewrites() {
    return [
      {
        // "/:path*.md" does not capture the path, so every .md URL served the homepage.
        source: '/:mdPath(.*)\\.md',
        destination: '/api/markdown?path=:mdPath',
      },
    ];
  },
};

export default withPayload(nextConfig);
