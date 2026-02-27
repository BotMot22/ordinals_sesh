/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        fs: false,
        path: false,
      };
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ordinals.com' },
      { protocol: 'https', hostname: 'ord-mirror.magiceden.dev' },
    ],
  },
};

export default nextConfig;
