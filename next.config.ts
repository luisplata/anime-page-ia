
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Ensures static export for index.html
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'backend.animebell.peryloth.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'animeflv.net',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: true, // Required for static export with next/image
  },
};

export default nextConfig;
