/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

/**
 * The configuration type used by the system. It defines the structure of the configuration
 * object, including patterns to match, exclusion rules, environment settings, plugins, and
 * various other options that influence the system's behavior.
 *
 * @since v1.0.0
 */
export type Veve = {
  /**
   * An array of glob patterns specifying which files to include in the processing.
   * Files matching these patterns will be processed by the system.
   *
   * @since v1.0.0
   * @type {string[]}
   */
  pattern: string[];

  /**
   * An array of glob patterns specifying which files to exclude from the processing.
   * Files matching these patterns will be ignored during processing.
   *
   * @since v1.0.0
   * @type {string[]}
   */
  exclude: string[];

  /**
   * A list of environments that the system should support (e.g., 'production', 'development').
   * This could be used to configure different behaviors depending on the environment.
   *
   * @since v1.0.0
   * @type {string[]}
   */
  envs: string[];

  /**
   * An array of plugins to be used by the system. Each plugin will modify or extend the system's behavior.
   * This allows customization of the system's functionality.
   *
   * @since v1.0.0
   * @type {any[]}
   */
  plugins: any[];

  /**
   * The maximum timeout (in milliseconds) for each operation or task. This determines how long the system
   * will wait for an operation before it is considered to have failed.
   *
   * @since v1.0.0
   * @type {number}
   */
  timeout: number;

  /**
   * A flexible context object that can store any custom data. This context can be used for passing additional
   * information during the processing or configuring specific runtime parameters in the system.
   *
   * @since v1.0.0
   * @type {Record<any, any>}
   */
  context: Record<any, any>;
};