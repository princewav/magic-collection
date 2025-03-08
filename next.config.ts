import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Your existing image configurations
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
        port: '',
        pathname: '/normal/front/**',
      },
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
        port: '',
        pathname: '/art_crop/front/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.scryfall.com',
        port: '',
        pathname: '/cards/**',
      },
    ],
  },

  // Add webpack configuration to handle PouchDB
  // webpack: (config, { isServer }) => {
  //   // PouchDB has a dependency on 'leveldown' which uses native modules
  //   if (!isServer) {
  //     // Don't attempt to use native modules in the browser
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //       path: false,
  //       os: false,
  //       crypto: false,
  //       pouchdb: require.resolve('pouchdb-browser'),
  //     };
  //   }

  //   return config;
  // },

  // Use the correct property name as per the error message
  serverExternalPackages: ['pouchdb', 'leveldown'],
};

export default nextConfig;
