module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true
        }
      ]
    ],
    plugins: [
      // Babel runtime transform - 必須放在最前面
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true
      }],
      // 處理 import.meta 語法
      '@babel/plugin-syntax-import-meta',
      // 模塊路徑解析
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json']
      }]
    ]
  };
}; 