import { TestConfig } from "./types";

const config: TestConfig = {
  filePattern: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
  testDirectory: "",
  exclude: ["**/node_modules/**", "**/dist/**"],
  
  reporters: ["spec"], // Different formats for test results (e.g., 'spec', 'json', 'html')
  outputDir: "", // Directory for storing test result files

  useColors: true
};

export default config;
