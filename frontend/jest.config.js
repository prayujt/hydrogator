/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  // transform: {
  //   "^.+\\.(tsx|ts|js)$": ["ts-jest",{}],
  // },
  // transformIgnorePatterns: [
  //   `/node_modules/(?!(somePkg)|react-dnd|core-dnd|@react-dnd)`,
  // ],
  preset: "ts-jest",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testPathIgnorePatterns: ["/node_modules/"],
  testRegex: ".*.(test|spec).(j|t)s[x]?$",
  transform: {
      "node_modules/(react-dnd|dnd-core|@react-dnd)/.+\\.(j|t)sx?$": "ts-jest",
      "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: [`/node_modules/(?!(somePkg)|react-dnd|dnd-core|@react-dnd)`],
};