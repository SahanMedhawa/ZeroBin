module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  extensionsToTreatAsEsm: [".jsx"],
  testEnvironment: "node",
  setupFilesAfterEnv: ["./backend/tests/setup.js"],
};
