/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "kleur";
import { isReporterPlugin } from "../reporter/Reporter.js";
import { getType } from "../utils/index.js";


export function isValidConfig(veve: any): boolean {
  const errors: string[] = [];

  // Helper to log errors
  const logError = (field: string, message: string) => {
    errors.push(`${kleur.red("× ERROR(CONFIG)")} in ${kleur.green(field)}: ${kleur.bold(message)}`);
  };

  // Check pattern (required)
  if (!Array.isArray(veve.pattern) || !veve.pattern.every((item: any) => getType(item) === "string")) {
    logError("pattern", "Expected an array of strings.");
  }

  // Check exclude (optional)
  if (
    veve.exclude !== undefined &&
    (!Array.isArray(veve.exclude) || !veve.exclude.every((item: any) => getType(item) === "string"))
  ) {
    logError("exclude", "Expected an array of strings.");
  }

  // Check envs (optional)
  if (
    veve.envs !== undefined &&
    (!Array.isArray(veve.envs) || !veve.envs.every((item: any) => getType(item) === "string"))
  ) {
    logError("envs", "Expected an array of strings.");
  }

  // Check plugins (optional)
  if (
    veve.plugins !== undefined &&
    (!Array.isArray(veve.plugins) || !veve.plugins.every((item: any) => getType(item) === "object" && item.name))
  ) {
    logError(
      "plugins",
      "Expected an array of Plugin objects with a valid 'name' property."
    );
  }

  // Check timeout (optional)
  if (veve.timeout !== undefined && getType(veve.timeout) !== "number") {
    logError("timeout", "Expected a number.");
  }

  // Check context (optional)
  if (veve.context !== undefined && (getType(veve.context) !== "object" || veve.context === null)) {
    logError("context", "Expected an object.");
  }

  // Check tsconfig (optional)
  if (
    veve.tsconfig !== undefined &&
    (getType(veve.tsconfig) !== "object" || veve.tsconfig === null)
  ) {
    logError("tsconfig", "Expected an object with a 'compilerOptions' property.");
  }

  // Check outputDir (optional)
  if (veve.outputDir !== undefined && getType(veve.outputDir) !== "string") {
    logError("outputDir", "Expected a string.");
  }

  // Check formats (optional)
  if (
    veve.formats !== undefined &&
    (!Array.isArray(veve.formats) || !veve.formats.every((item: any) => getType(item) === "string"))
  ) {
    logError("formats", "Expected an array of strings.");
  }

  // Check timestamp (optional)
  if (veve.timestamp !== undefined && getType(veve.timestamp) !== "boolean") {
    logError("timestamp", "Expected a boolean.");
  }

  // Check reporters (optional)
  if (
    veve.reporters !== undefined &&
    (!Array.isArray(veve.reporters) || !veve.reporters.every((item: any, index: number) => {
      try {
        isReporterPlugin(item, index);
        return true;
      } catch (e) {
        logError(`reporters[${index}]`, (e as Error).message);
        return false;
      }
    }))
  ) {
    logError(
      "reporters",
      "Expected an array of ReporterPlugin objects."
    );
  }

  // If there are errors, throw an aggregate error
  if (errors.length > 0) {
    console.log("!!!Cannot start with errors in configuration!!!\n\n")
    console.log(errors.join("\n"))
    process.exit(1)
  }

  return true;
}
