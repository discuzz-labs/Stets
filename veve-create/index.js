#!/usr/bin/env node
/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import fs from "fs";
import path from "path";
import { confirm, input, select } from "@inquirer/prompts";
import kleur from "kleur";

// Default test patterns
const DEFAULT_TEST_PATTERNS = [
  "**/*.test.ts",
  "**/*.test.js", 
  "**/*.spec.ts", 
  "**/*.spec.js",
  "**/__tests__/**/*.ts",
  "**/__tests__/**/*.js"
];

// Default exclusion patterns
const DEFAULT_EXCLUDE_PATTERNS = [
  "**/dist/**",
  "**/node_modules/**",
  "*.json",
  "**/coverage/**", 
  "**/logs/**",
  "**/*.config.*",
  "**/*.d.ts"
];

// Reporter choices with rich descriptions
const REPORTER_CHOICES = [
  {
    name: kleur.green("Console (Spec)"),
    value: "spec",
    description: "📝 Write detailed test results directly to the console."
  },
  {
    name: kleur.blue("JUnit XML"),
    value: "junit",
    description: "📊 Generate a machine-readable XML report for CI/CD integration."
  },
  {
    name: kleur.magenta("JSON Report"),
    value: "json",
    description: "🔌 Create a comprehensive JSON log of test results."
  }
];

async function overWriteConfigFile() {
  // Check if the configuration file already exists
  const configPath = path.join(process.cwd(), 'veve.config.ts');
  if (fs.existsSync(configPath)) {
    const overwrite = await confirm({
      message: kleur.red("A configuration file already exists. Overwrite it?"),
      default: false
    });

    if (!overwrite) {
      console.log(kleur.yellow("👋 Operation cancelled. Existing configuration file retained."));
      return;
    }
  }
}

async function generateVeveConfig() {
  const isAutoAccept = process.argv.includes("-y");

  if (isAutoAccept) {
    console.log(kleur.yellow("⚙️  Running in non-interactive mode with default settings."));
  }
  
  try {
    console.log(kleur.green("🚀 Veve Generator - Supercharge Your Testing! 🧪\n"));

    // Confirm config file generation
    const createConfigFile = isAutoAccept || await confirm({
      message: kleur.yellow("Would you like to create a Veve configuration file?"),
    });

    if (!createConfigFile) {
      console.log(kleur.red("👋 Config generation cancelled. Maybe next time!"));
      return;
    }

    await overWriteConfigFile()

    // Guided configuration with rich prompts and defaults
    const pattern = isAutoAccept 
      ? DEFAULT_TEST_PATTERNS 
      : await input({
      message: kleur.blue("🔍 Test file patterns (comma-separated glob/regex):"),
      default: DEFAULT_TEST_PATTERNS.join(", "),
      validate: (input) => {
        const patterns = input.split(',').map(p => p.trim()).filter(Boolean);
        return patterns.length > 0 ? true : "At least one pattern is required";
      },
      transformer: (input) => {
        // Ensure we always have an array of strings, even if input is empty
        const patterns = input.split(',').map(p => p.trim()).filter(Boolean);
        return patterns.length > 0 ? patterns : DEFAULT_TEST_PATTERNS;
      }
    });

    const exclude = isAutoAccept 
      ? DEFAULT_EXCLUDE_PATTERNS 
      : await input({
      message: kleur.blue("🚫 Exclude patterns (comma-separated glob/regex):"),
      default: DEFAULT_EXCLUDE_PATTERNS.join(", "),
      validate: (input) => {
        const excludePatterns = input.split(',').map(p => p.trim()).filter(Boolean);
        return excludePatterns.length > 0 ? true : "At least one exclude pattern is required";
      },
      transformer: (input) => {
        // Ensure we always have an array of strings, even if input is empty
        const excludePatterns = input.split(',').map(p => p.trim()).filter(Boolean);
        return excludePatterns.length > 0 ? excludePatterns : DEFAULT_EXCLUDE_PATTERNS;
      }
    });

    const envFiles = isAutoAccept 
      ? []
      : await input({
      message: kleur.blue("📂 Environment file paths (comma-separated relative to current directory):"),
        transformer: (input) => {
          // Ensure we always have an array of strings, even if input is empty
          const envFiles = input.split(',').map(p => p.trim()).filter(Boolean);
          return envFiles.length > 0 ? envFiles : [];
        },
      default: ""
    });

    const watch = isAutoAccept 
      ? false
      :  await confirm({
      message: kleur.yellow("🔄 Enable watch mode for continuous testing?"),
      default: false
    });

    const reporters = isAutoAccept 
      ? REPORTER_CHOICES[0].value
      : await select({
      message: kleur.magenta("📈 Select test reporter:"),
      choices: REPORTER_CHOICES
    });
    
    // Generate the configuration file content
    const configContent = `
// 🧪 Veve Test Configuration
// This file was generated with ❤️ by Veve Config Generator

import {veve} from 'veve';
import { ${reporters} } from "veve"

export default veve({
  // 🔍 Test File Patterns
  // Specify glob patterns to identify test files
  // Supports multiple patterns for flexibility
  pattern: [ ${pattern.map(p => `"${p}"`).join(', ')} ],

  // 🚫 Exclude Patterns
  // Paths and files to ignore during test discovery
  exclude: [ ${exclude.map(p => `"${p}"`).join(', ')} ],

  // 📂 Environment Files
  // Relative paths to environment configuration files
  envs: [ ${envFiles.map(p => `"${p}"`).join(', ')} ],

  // ⏱️ Test Timeout (in milliseconds)
  // Maximum execution time for a single test
  timeout: 600_000, // 10 minutes

  // 🌍 Test Context
  // Shared context/setup for all tests (optional)
  context: {},

  // 🔧 Build Plugins
  // Additional esbuild plugins for test transpilation
  plugins: [],

  // 📝 TypeScript Configuration
  // Custom TypeScript compiler options
  tsconfig: {},

  // 🔄 Watch Mode
  // Continuously run tests on file changes
  watch: ${watch},

  // 📦 Additional Modules
  // Modules to auto-require in test files
  require: [],

  // 📊 Test Reporters
  // Configure how test results are reported
  reporters: [{ reporter: ${reporters} }],

  // 💾 Output Directory
  // Location for generated test reports
  output: 'veve'
});
`;

    // Write the configuration file
    const configPath = path.join(process.cwd(), 'veve.config.ts');
    fs.writeFileSync(configPath, configContent);

    // Success message
    console.log(`
✅ Veve configuration file created successfully!
📍 Location: ${configPath}

🚀 Next steps:
   1. Review the generated configuration
   2. Customize as needed
   3. Run the tests with \`npm run test\`
`);

  } catch (error) {
    if (error instanceof Error && error.name === "ExitPromptError") {
      console.log(kleur.red("👋 Configuration cancelled."));
    } else {
      console.error(kleur.red("❌ An error occurred:"), error);
    }
  }
}

// Run the configuration generator
generateVeveConfig();