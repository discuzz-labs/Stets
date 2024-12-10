import type { Veve } from './config/Config.js';
import { spec } from './reporter/spec.js';

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
  reporters: [spec],
  output: "veve"
};

export default config;
