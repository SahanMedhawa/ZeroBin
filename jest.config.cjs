module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  extensionsToTreatAsEsm: [".jsx"],
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.js"],
};
