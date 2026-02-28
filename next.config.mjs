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
      syncWebAssembly: true,
      layers: true,
    };

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Suppress tiny-secp256k1 WASM warning
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /tiny-secp256k1/ },
    ];

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
