const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 為 Web 平台添加 ESM 支持
config.resolver.platforms = ['ios', 'android', 'web'];

// 添加 .cjs 支持以解決 Firebase Auth 問題
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

// Web 平台特定配置
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: true,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    warnings: false,
  },
};

// 解決 import.meta 問題的配置
config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'main'],
  // 添加 .cjs 支持以解決 Firebase Auth 問題
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  unstable_enablePackageExports: false,
  alias: {
    ...config.resolver.alias,
    // 防止 import.meta 相關錯誤
    'import-meta-resolve': false,
  },
};

module.exports = config; 