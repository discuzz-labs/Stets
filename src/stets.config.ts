import { TestConfig } from "./types"

const config : TestConfig = {
  filePattern: [ "**/*.test.ts" , "**/*.test.js", "**/*.spec.ts" , "**/*.spec.js"],
  testDirectory: "",
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
  ]
}

export default config