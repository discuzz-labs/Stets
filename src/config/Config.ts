/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import { join } from "path";
import { existsSync } from "fs";
import config from "../veve.config.js";

export type Veve = {
    pattern: string[];
    exclude: string[];
    envs: string[];
};

export class Config {
    private config: Veve = config;

    constructor(configPath: string | undefined) {
        // Initialize the config property based on the configPath
        if (configPath && existsSync(join(process.cwd(), configPath))) {
            this.config = require(join(process.cwd(), configPath)).default;
        }
    }

    public get<K extends keyof Veve>(key: K): Veve[K] {
        return this.config[key];
    }
}
