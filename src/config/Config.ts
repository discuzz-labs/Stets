/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Plugin } from 'esbuild';
import { existsSync } from 'fs';
import { join, extname } from 'path';
import config from '../veve.config.js';
import { createRequire } from 'module';
import { ErrorInspect } from '../core/ErrorInspect.js';
import { ReporterPlugin } from '../reporter/Reporter.js';

/**
 * Type representing the configuration options for Veve.
 */
export interface Veve {
  /**
   * A list of patterns to include for processing.
   * @example ['src/app.ts', 'src/utils.tsx']
   */
  pattern: string[];

  /**
   * A list of patterns to exclude from processing.
   * @example ['node_modules', 'dist']
   */
  exclude: string[];

  /**
   * A list of environment names where this configuration will be applied.
   * @example ['development', 'production', 'test']
   */
  envs: string[];

  /**
   * A list of eabuild plugins to be used in the configuration.
   */
  plugins: Plugin[];

  /**
   * The timeout value in milliseconds for operations.
   * @example 3000
   */
  timeout: number;

  /**
   * A context object that can hold any key-value pair.
   * @example { key: 'value', flag: true }
   */
  context: Record<any, any>;

  /**
   * The TypeScript configuration options.
   * @example { strict: true, baseUrl: './' }
   */
  tsconfig: Tsconfig;

  /**
   * Whether to watch files for changes.
   * @example true
   */
  watch: boolean;

  /**
   * List of modules to auto require inside the testing files
   * @example ["jsdom-global/register"]
   */
  require: string[],

  /**
   * List of reporter plugins
   * @example ["jsdom-global/register"]
   */
  reporters: ReporterPlugin[];

  /**
   * Defines the file path for reporters to save their outputs.
   * @example "./reports"
   */
  output: string;
}

/**
 * Interface representing TypeScript configuration options.
 */
export interface Tsconfig {
  /**
   * Whether to enforce strict mode in all files.
   * @example true
   */
  alwaysStrict?: boolean;

  /**
   * The base URL for module resolution.
   * @example './src'
   */
  baseUrl?: string;

  /**
   * Enables experimental decorator support.
   * @example true
   */
  experimentalDecorators?: boolean;

  /**
   * Specifies how imports not used as values should be treated.
   * @example 'remove'
   */
  importsNotUsedAsValues?: 'remove' | 'preserve' | 'error';

  /**
   * Specifies the JSX code generation style.
   * @example 'react-jsx'
   */
  jsx?: 'preserve' | 'react-native' | 'react' | 'react-jsx' | 'react-jsxdev';

  /**
   * Factory function for creating JSX elements.
   * @example 'React.createElement'
   */
  jsxFactory?: string;

  /**
   * Factory function for creating JSX fragment elements.
   * @example 'React.Fragment'
   */
  jsxFragmentFactory?: string;

  /**
   * Specifies the module specifier for JSX imports.
   * @example '@emotion/react'
   */
  jsxImportSource?: string;

  /**
   * A mapping of module paths to arrays of paths.
   * @example { '@utils': ['./src/utils'] }
   */
  paths?: Record<string, string[]>;

  /**
   * Whether to preserve value imports in the emitted JavaScript.
   * @example true
   */
  preserveValueImports?: boolean;

  /**
   * Whether to enable strict type checking options.
   * @example true
   */
  strict?: boolean;

  /**
   * Whether to use `define` for class field initialization.
   * @example true
   */
  useDefineForClassFields?: boolean;

  /**
   * Whether to keep the module syntax as-is in the emitted JavaScript.
   * @example true
   */
  verbatimModuleSyntax?: boolean;
}

export function veve(config: Partial<Veve>): Partial<Veve> {
  return config;
}

export class Config {
  private config: Veve = config;
  private require = createRequire(process.cwd());

  async load(configPath: string | undefined): Promise<Config> {
    if (configPath) {
      const fullPath = join(process.cwd(), configPath);
      if (existsSync(fullPath)) {
        await this.loadConfig(fullPath);
      } else {
        console.error(`Configuration file not found: ${fullPath}`);
        process.exit(1);
      }
    } else {
      const possibleFiles = [
        'veve.config.js',
        'veve.config.ts',
        'veve.js',
        'veve.ts',
        'test.config.js',
        'test.config.ts',
      ];
      const foundFile = possibleFiles.find((file) =>
        existsSync(join(process.cwd(), file)),
      );

      if (foundFile) {
        await this.loadConfig(join(process.cwd(), foundFile));
      }
    }

    return this;
  }

  private async loadConfig(filePath: string): Promise<void> {
    const ext = extname(filePath);

    // Directly import the configuration file
    if (ext === '.ts' || ext === '.js') {
      try {
        const module = await this.require(filePath);
        this.applyConfig(module.default);
      } catch (error: any) {
        console.log(ErrorInspect.format({ error }));
        process.exit(1);
      }
    } else {
      console.error(
        `Unsupported configuration file type: ${ext}. Only .js, and .ts are supported. Got: ${filePath} `,
      );
      process.exit(1);
    }
  }

  private applyConfig(configModule: Partial<Veve>): void {
    if (configModule === undefined) {
      console.error(
        `No Configuretion was default exported form the configuration file.`,
      );
      process.exit(1);
    }
    this.config = { ...config, ...configModule };
  }

  public get<K extends keyof Veve>(key: K): Veve[K] {
    return this.config[key];
  }
}
