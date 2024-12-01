import type { Veve } from "./config/Config.js";

const config: Veve = {
  pattern: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
  exclude: ["**/dist/**", "*.json"],
  envs: [],
  timeout: 600_000,
  context: {},
  plugins: [],
  tsconfig: {},
  timestamp: false,
  outputDir: "",
  formats: ["json"],
  watch: false
};

export default config;
