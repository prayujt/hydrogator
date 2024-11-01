module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo', 
        {
          jsxImportSource: 'nativewind',
        }
      ],
      // 'module:metro-react-native-babel-preset', // Breaks static rendering
      "nativewind/babel",
      // [
      //   '@babel/preset-env', 
      //   {
      //     modules: false,
      //     loose: true, // Set loose mode for preset-env as well
      //   }
      // ], // Makes the page blank?
      // '@babel/preset-react', // Breaks React
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
