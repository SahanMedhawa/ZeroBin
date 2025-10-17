module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  extensionsToTreatAsEsm: [".jsx"],
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "backend/**/*.js",
    "!backend/index.js",
    "!backend/config/**",
    "!backend/tests/**",
    "!backend/scripts/**",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
  ],
  // Note: Coverage thresholds are commented out
  // Uncomment when you have comprehensive test suite
  // coverageThreshold: {
  //   global: {
  //     branches: 60,
  //     functions: 60,
  //     lines: 60,
  //     statements: 60,
  //   },
  // },
};
