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