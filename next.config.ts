import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
  },
};

export default nextConfig;
