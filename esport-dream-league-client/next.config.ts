const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'arweave.net',
      'ipfs.io',
      'dweb.link',
      'gateway.pinata.cloud',
      'via.placeholder.com', // ✅ Add this for the fallback
    ],
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  webpack: (config: { resolve: { fallback: { fs: boolean; path: boolean; os: boolean; crypto: string; stream: string; }; }; plugins: any[]; }, { }: any) => {
    config.resolve.fallback = { 
      fs: false,
      path: false,
      os: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    };

    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        'process.env.SOLANA_NETWORK': JSON.stringify(process.env.SOLANA_NETWORK || 'devnet'),
        'process.env.RPC_ENDPOINT': JSON.stringify(process.env.RPC_ENDPOINT || 'https://rpc.ankr.com/solana_devnet/859e3dfc5fea2edd45e9dd3fd2748eee4daa40a8a5281a967b0d3d08e87afafe'),
      })
    );

    return config;
  },
  env: {
    SOLANA_NETWORK: process.env.SOLANA_NETWORK || 'devnet',
    RPC_ENDPOINT: process.env.RPC_ENDPOINT || 'https://rpc.ankr.com/solana_devnet/859e3dfc5fea2edd45e9dd3fd2748eee4daa40a8a5281a967b0d3d08e87afafe',
    SECONDARY_RPC_ENDPOINT: process.env.SECONDARY_RPC_ENDPOINT || 'https://devnet.genesysgo.net',
  },
}

module.exports = nextConfig;
