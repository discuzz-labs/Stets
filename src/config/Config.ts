/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Plugin } from "esbuild"; // Ensure to import your Plugin type
import { existsSync } from "fs";
import { join } from "path";
import config from "../veve.config.js";
import { getType } from "../utils/index.js";
import fs from "fs";

export type Veve = {
    pattern: string[];
    exclude: string[];
    envs: string[];
    plugins: Plugin[];
    timeout: number;
    context: Record<any, any>;
    tsconfig: string;
};

export class Config {
    private config: Veve = config;

    async load(configPath: string | undefined): Promise<Config> {
        // Initialize the config property based on the configPath
        if (configPath && existsSync(join(process.cwd(), configPath))) {
            const module = await import(join(process.cwd(), configPath));
            this.validConfig(module.default) === false ? process.exit(1) : "";
            this.config = { ...config, ...module.default };
        } else {
            this.config = config;
        }
        return this;
    }

    validConfig(config?: Partial<Veve>): boolean {
        if (!config || getType(config) !== "object") {
            console.error("Invalid configuration: Config must be an object.");
            return false;
        }

        // Pattern validation (optional)
        if (config.pattern != null) {
            if (
                !Array.isArray(config.pattern) ||
                !config.pattern.every((item) => getType(item) === "string")
            ) {
                console.error(
                    'Invalid configuration: "pattern" must be an array of strings.',
                );
                return false;
            }
        }

        // Exclude validation (optional)
        if (config.exclude !== undefined) {
            if (
                !Array.isArray(config.exclude) ||
                !config.exclude.every((item) => getType(item) === "string")
            ) {
                console.error(
                    'Invalid configuration: "exclude" must be an array of strings.',
                );
                return false;
            }
        }

        // Envs validation (optional)
        if (config.envs != null) {
            if (
                !Array.isArray(config.envs) ||
                !config.envs.every((item) => getType(item) === "string")
            ) {
                console.error(
                    'Invalid configuration: "envs" must be an array of strings.',
                );
                return false;
            }
        }

        // Plugins validation (optional)
        if (config.plugins != null) {
            if (
                !Array.isArray(config.plugins) ||
                !config.plugins.every(
                    (item) =>
                        typeof item === "object" &&
                        item.name &&
                        typeof item.name === "string",
                )
            ) {
                console.error(
                    'Invalid configuration: "plugins" must only contain valid esbuild Plugin objects.',
                );
                return false;
            }
        }

        // Timeout validation (optional)
        if (config.timeout != null && getType(config.timeout) !== "number") {
            console.error('Invalid configuration: "timeout" must be a number.');
            return false;
        }

        // Context validation (optional)
        if (config.context != null && getType(config.context) !== "object") {
            console.error(
                'Invalid configuration: "context" must be an object.',
            );
            return false;
        }

        // Context validation (optional)
        if (config.tsconfig != null && getType(config.tsconfig) !== "string") {
            console.error(
                'Invalid configuration: "context" must be an object.',
            );
            return false;
        }

        if (
            config.tsconfig != null &&
            !fs.existsSync(join(process.cwd() + config.tsconfig))
        ) {
            console.error(
                "Invalid configuration: tsconfig must be a valid path. No tsconfig.json found in " +
                    join(process.cwd() + config.tsconfig),
            );
            return false;
        }

        // If all checks pass
        return true;
    }

    public get<K extends keyof Veve>(key: K): Veve[K] {
        return this.config[key];
    }
}
