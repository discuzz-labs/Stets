/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { Plugin } from "esbuild";
import { existsSync } from "fs";
import { join, extname } from "path";
import config from "../veve.config.js";
import "esbuild-register";
import { createRequire } from "module";
import { ErrorInspect } from "../core/ErrorInspect.js";
import { Tsconfig } from "./types.js";

export type Veve = {
    pattern: string[];
    exclude: string[];
    envs: string[];
    plugins: Plugin[];
    timeout: number;
    context: Record<any, any>;
    tsconfig: Tsconfig;
    outputDir: string;
    formats: string[];
    timestamp: boolean;
};

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
                "veve.config.js",
                "veve.config.ts",
                "veve.js",
                "veve.ts",
                "test.config.js",
                "test.config.ts",
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
        if (ext === ".ts" || ext === ".js") {
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
