import type { Veve } from './config/Config.js';
import { consoleReporter } from './reporter/plugins/consoleReporter.js';

const config: Veve = {
  pattern: ['**/*.test.ts', '**/*.test.js', '**/*.spec.ts', '**/*.spec.js'],
  exclude: ['**/dist/**', '*.json'],
  envs: [],
  timeout: 600_000,
  context: {},
  plugins: [],
  tsconfig: {},
  watch: false,
  require: [],
  reporters: [consoleReporter]
};

export default config;
