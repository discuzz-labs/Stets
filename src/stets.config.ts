import { TestConfig } from "./types"

const config : TestConfig = {
  filePattern: [ "**/*.test.ts" , "**/*.test.js", "**/*.spec.ts" , "**/*.spec.js"],
  testDirectory: "",
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
  ],

  reporters: ["spec", "csv" , "xml"], // Different formats for test results (e.g., 'spec', 'json', 'html')
  outputDir: "test-results", // Directory for storing test result files
  silent: false, // Suppress output unless there's an error

}

export default config