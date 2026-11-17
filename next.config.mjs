import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
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
        source: '/:path*.md',
        destination: '/api/markdown?path=:path*',
      },
    ];
  },
};

export default withPayload(nextConfig);
