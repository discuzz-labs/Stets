import { TestConfig } from "./types";

const config: TestConfig = {
  filePattern: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
  testDirectory: "examples",
  exclude: ["**/node_modules/**", "**/dist/**"],
  suppressValidations: false, // setting that to true can cause unexpected behaviour

  reporters: ["spec"], // Different formats for test results (e.g., 'spec', 'json', 'html')
  outputDir: "", // Directory for storing test result files
  silent: false, // Suppress output unless there's an error

  useIdentation: true,
  useColors: true,
  clearConsole: false,
};

export default config;
