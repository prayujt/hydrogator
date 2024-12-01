/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testTimeout: 30000,
  testEnvironment: "jsdom", // 'jsdom' simulates a browser environment
  preset: "jest-expo",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "ios.js", "android.js", "native.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  testRegex: ".*.(test|spec).(j|t)s[x]?$",
  transform: {
      "node_modules/(react-dnd|dnd-core|@react-dnd)/.+\\.(j|t)sx?$": "ts-jest",
      '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|expo-modules-core|expo-router|lucide-react-native|@expo|nativewind|@gluestack-ui/nativewind-utils|react-native-css-interop|@expo/vector-icons|expo-font|expo-asset|expo-constants|mapbox-gl)/)',
  ],
  moduleNameMapper: {
    'mapbox-gl': '<rootDir>/__mocks__/mapbox-gl.js',
    '\\.css$': 'identity-obj-proxy', // if not already added
  },
  globals: {
    __DEV__: true
  },
  // collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/app/**/*.{ts,tsx,js,jsx}", // Only include files in the /app/ directory
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/expo-env.d.ts",
    "!**/.expo/**"
  ]
};
