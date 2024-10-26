import { TestConfig } from "./config/Config";

const config: TestConfig = {
  pattern: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
  testDirectory: "",
  exclude: ["node_modules", "**/dist/**"],
  
  reporters: ["spec"], // Different formats for test results (e.g., 'spec', 'json', 'html')
  outputDir: "", // Directory for storing test result files

  env: [".env", ".env.development", ".env.test", ".env.production" , ".env.prod", ".env.dev", ".env.local"]
};

export default config;
