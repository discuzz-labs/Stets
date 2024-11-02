import type { Veve } from "./config/Config";

const config: Veve = {
  pattern: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
  exclude: ["**/dist/**", "*.json"],
  reporters: ["spec"]
};

export default config;
