/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import chalk from 'chalk';

/**
 * Base class for custom errors with a code and additional context.
 */
export class StetsError extends Error {
  public code: string;
  public details?: string; // Updated to be a string

  /**
   * @param message - The error message.
   * @param code - A unique error code identifying the type of error.
   * @param details - Additional context or data about the error.
   */
  constructor(message: string, code: string, details?: string) {
    super(message);
    this.name = this.constructor.name; // Set the name to the class name
    this.code = code;
    this.details = details;

    // Maintain proper stack trace for where our error was thrown (only in V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a string representation of the error details.
   */
  private logDetails(): string {
    return this.details ? chalk.gray(this.details) : "No details provided";
  }

  /**
   * Logs the error with a colored format including details and stack trace.
   */
  public logError(): void {
    console.error(chalk.red(`[${this.name}][${this.code}] : ${this.message}`));
    console.error(this.logDetails()); // Call the method to get details
    if (this.stack) {
      console.error(chalk.gray(`Stack trace: ${this.stack}`));
    }
  }
}