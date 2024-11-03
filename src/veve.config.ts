import type { Veve } from "./config/Config";

const config: Veve = {
  pattern: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
  exclude: ["**/dist/**", "*.json"],
  reporters: [],
  outputDir: "results",
};

export default config;
