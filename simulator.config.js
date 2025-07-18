// Simulator specific configuration to handle protocol parsing issues
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Override for simulator to handle protocol parsing
config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'main'],
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  unstable_enablePackageExports: false,
  alias: {
    ...config.resolver.alias,
    'import-meta-resolve': false,
  },
  protocols: ['http', 'https', 'exp', 'exps']
};

// Special server configuration for simulator
config.server = {
  ...config.server,
  port: 8081,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      // More permissive headers for simulator
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Max-Age', '86400');
      
      // Handle all preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      return middleware(req, res, next);
    };
  }
};

module.exports = config;