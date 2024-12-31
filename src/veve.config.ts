import type { Veve } from "./config/Config.js";
import { spec } from "./reporter/spec.js";

const config: Veve = {
  pattern: [
    "**/*.test.ts",
    "**/*.test.js",
    "**/*.spec.ts",
    "**/*.spec.js",
    "**/__tests__/**/*.ts",
    "**/__tests__/**/*.js",
  ],
  exclude: [
    "**/dist/**", // Compiled or distribution files
    "**/node_modules/**", // Dependencies
    "*.json", // JSON configuration files
    "**/coverage/**", // Coverage reports
    "**/logs/**", // Log files
    "**/*.config.*", // Configuration files
    "**/*.d.ts", // Type declaration files
  ],
  envs: [],
  timeout: 600_000,
  context: {},
  plugins: [],
  tsconfig: {},
  watch: false,
  require: [],
  reporters: [{ reporter: spec }],
  output: "veve",
};

export default config;
