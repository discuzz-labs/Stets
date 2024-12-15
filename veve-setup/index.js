#!/usr/bin/env node
/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import fs from "fs";
import path from "path";
import { confirm, input, select } from "@inquirer/prompts";
import { spawn } from "child_process";
import kleur from "kleur";

// Default test patterns
const DEFAULT_TEST_PATTERNS = [
  "**/*.test.ts",
  "**/*.test.js",
  "**/*.spec.ts",
  "**/*.spec.js",
  "**/__tests__/**/*.ts",
  "**/__tests__/**/*.js",
];

// Default exclusion patterns
const DEFAULT_EXCLUDE_PATTERNS = [
  "**/dist/**",
  "**/node_modules/**",
  "*.json",
  "**/coverage/**",
  "**/logs/**",
  "**/*.config.*",
  "**/*.d.ts",
];

// Reporter choices with descriptions
const REPORTER_CHOICES = [
  {
    name: "Console (Spec)",
    value: "spec",
    description: "Write detailed test results directly to the console.",
  },
  {
    name: "JUnit XML",
    value: "junit",
    description:
      "Generate a machine-readable XML report for CI/CD integration.",
  },
  {
    name: "JSON Report",
    value: "json",
    description: "Create a comprehensive JSON log of test results.",
  },
];

// Package managers
const PACKAGE_MANAGERS = [
  {
    name: "npm",
    value: "npm",
    description: "Node Package Manager (default)",
  },
  {
    name: "yarn",
    value: "yarn",
    description: "Yarn Package Manager",
  },
  {
    name: "pnpm",
    value: "pnpm",
    description: "Performant npm (pnpm)",
  },
];

async function checkPackageJson() {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.log(kleur.red("× No package.json found in the current directory."));
    console.log(
      "Please run this script in a Node.js project with an existing package.json",
    );
    process.exit(1);
  }
}

async function overWriteConfigFile() {
  const configPath = path.join(process.cwd(), "veve.config.ts");
  if (fs.existsSync(configPath)) {
    const overwrite = await confirm({
      message: "A configuration file already exists. Overwrite it?",
      default: false,
    });

    if (!overwrite) {
      console.log(
        kleur.yellow(
          "Operation cancelled. Existing configuration file retained.",
        ),
      );
      return false;
    }
  }
  return true;
}

async function generateVeveConfig() {
  const isAutoAccept = process.argv.includes("-y");

  if (isAutoAccept) {
    console.log(
      kleur.gray("Running in non-interactive mode with default settings."),
    );
  }

  try {
    // Confirm config file generation
    const createConfigFile =
      isAutoAccept ||
      (await confirm({
        message: "Would you like to create a Veve configuration file?",
      }));

    if (!createConfigFile) {
      console.log(
        kleur.yellow("Config generation cancelled. Maybe next time!"),
      );
      return;
    }

    const canOverwrite = await overWriteConfigFile();
    if (!canOverwrite) {
      console.log(
        kleur.yellow("Config overwrite cancelled. Maybe next time!"),
      );
      return;
    }

    // Guided configuration with rich prompts and defaults
    const pattern = isAutoAccept
      ? DEFAULT_TEST_PATTERNS
      : await input({
          message: "Test file patterns (comma-separated glob/regex):",
          default: DEFAULT_TEST_PATTERNS.join(", "),
          validate: (input) => {
            const patterns = input
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            return patterns.length > 0
              ? true
              : "At least one pattern is required";
          },
          transformer: (input) => {
            const patterns = input
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            return patterns.length > 0 ? patterns : DEFAULT_TEST_PATTERNS;
          },
        });

    const exclude = isAutoAccept
      ? DEFAULT_EXCLUDE_PATTERNS
      : await input({
          message: "Exclude patterns (comma-separated glob/regex):",
          default: DEFAULT_EXCLUDE_PATTERNS.join(", "),
          validate: (input) => {
            const excludePatterns = input
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            return excludePatterns.length > 0
              ? true
              : "At least one exclude pattern is required";
          },
          transformer: (input) => {
            const excludePatterns = input
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            return excludePatterns.length > 0
              ? excludePatterns
              : DEFAULT_EXCLUDE_PATTERNS;
          },
        });

    const envFiles = isAutoAccept
      ? []
      : await input({
          message:
            "Environment file paths (comma-separated relative to current directory):",
          transformer: (input) => {
            const envFiles = input
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            return envFiles.length > 0 ? envFiles : [];
          },
          default: "",
        });

    const watch = isAutoAccept
      ? false
      : await confirm({
          message: "Enable watch mode for continuous testing?",
          default: false,
        });

    const reporters = isAutoAccept
      ? REPORTER_CHOICES[0].value
      : await select({
          message: "Select test reporter:",
          choices: REPORTER_CHOICES,
        });

    // Generate the configuration file content
    const configContent = `
// Veve Test Configuration
// This file was generated by Veve Config Generator

import {veve, ${reporters}} from 'veve';

export default veve({
  pattern: [ ${(Array.isArray(pattern) ? pattern : pattern.split(",").map((p) => p.trim())).map((p) => `"${p}"`).join(", ")} ],
  exclude: [ ${(Array.isArray(exclude) ? exclude : exclude.split(",").map((p) => p.trim())).map((p) => `"${p}"`).join(", ")} ],
  envs: [ ${(Array.isArray(envFiles) ? envFiles : envFiles.split(",").map((p) => p.trim())).map((p) => `"${p}"`).join(", ")} ],
  timeout: 600_000,
  context: {},
  plugins: [],
  tsconfig: {},
  watch: ${watch},
  require: [],
  reporters: [{ reporter: ${reporters} }],
  output: 'veve'
});
`;

    // Write the configuration file
    const configPath = path.join(process.cwd(), "veve.config.ts");
    fs.writeFileSync(configPath, configContent);
  } catch (error) {
    if (error instanceof Error && error.name === "ExitPromptError") {
      console.log(kleur.yellow("□ Configuration cancelled."));
    } else {
      console.error(kleur.red("× An error occurred:", error));
    }
  }
}

async function installDependencies() {
  // Select package manager
  const packageManager = await select({
    message: "Choose your package manager:",
    choices: PACKAGE_MANAGERS,
  });

  // Confirm installation
  const confirmInstall = await confirm({
    message: `Do you want to install veve and proxyquire using ${packageManager}?`,
    default: false,
  });

  if (!confirmInstall) {
    console.log(kleur.yellow("□ Dependency installation skipped."));
    return;
  }

  // Installation commands
  const installCommands = {
    npm: {
      veve: "npm install --save-dev veve",
      proxyquire: "npm install --save-dev proxyquire @types/proxyquire",
    },
    yarn: {
      veve: "yarn add -D veve",
      proxyquire: "yarn add -D proxyquire @types/proxyquire",
    },
    pnpm: {
      veve: "pnpm add -D veve",
      proxyquire: "pnpm add -D proxyquire @types/proxyquire",
    },
  };

  try {
    // Use await to ensure sequential execution
    await installPackage("veve", installCommands[packageManager].veve);
    await installPackage("proxyquire", installCommands[packageManager].proxyquire);

    // This message will only be displayed after both packages are installed
    console.log(kleur.green("✓ All packages installed successfully!"));
  } catch (error) {
    console.error(kleur.red(`× An error occurred: ${error.message}`));
  }
}

function installPackage(packageName, command) {
  return new Promise((resolve, reject) => {
    console.log(`Installing ${packageName}...`);
    const process = spawn(command, { shell: true, stdio: "inherit" });

    process.on("close", (code) => {
      if (code === 0) {
        console.log(kleur.green(`✓ ${packageName} installed successfully`));
        resolve();
      } else {
        reject(
          new Error(`${packageName} installation failed with code ${code}`)
        );
      }
    });
  });
}

function updatePackageJsonScripts() {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.test = "veve";
    packageJson.scripts["test:watch"] = "veve --watch";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(kleur.green("✓ Updated package.json with Veve test scripts"));
  } catch (error) {
    console.error(kleur.red("× Could not update package.json:", error));
  }
}

async function main() {
  try {
    // Check for package.json first
    await checkPackageJson();

    // Display welcome message
    console.log(`
Welcome to Veve Test Setup Wizard

This wizard will help you:
- Generate a Veve test configuration
- Update package.json scripts
- Install necessary dependencies

Let's get started!
`);

    // Generate Veve configuration
    await generateVeveConfig();

    // Install dependencies
    await installDependencies();

    // Update package.json scripts
    updatePackageJsonScripts();

    // Final success message
    console.log(`
Setup Complete!

Next steps:
1. Review your veve.config.ts
2. Run tests with: npm test
3. Run tests in watch mode: npm run test:watch

Happy Testing!
`);
  } catch (error) {
    console.error(kleur.red("× Setup failed:", error));
  }
}

// Run the main setup process
main();
