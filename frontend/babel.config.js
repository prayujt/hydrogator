module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'module:metro-react-native-babel-preset',
      [
        'babel-preset-expo', 
        {
          jsxImportSource: 'nativewind',
        }
      ],
      "nativewind/babel",
      [
        '@babel/preset-env', 
        {
          modules: false,
          loose: true, // Set loose mode for preset-env as well
        }
      ],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      // Add these plugins with loose mode explicitly set
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ],
  };
};
