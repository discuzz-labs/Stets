import { CLIOptions } from "../types";
import { Log } from "./Log";

export class Env {
  public static envPrefix: string = "STETS_";

  constructor(private options: CLIOptions) {
    this.setEnvVariables();
  }

  // Method to set environment variables based on the passed options
  private setEnvVariables(): void {
    Object.keys(this.options).forEach((key) => {
      const envKey = `${Env.envPrefix}${key.toUpperCase()}`;
      const value = (this.options as any)[key];
      process.env[envKey] = String(value);
      Log.info(`Setting ${Env.envPrefix}${key.toUpperCase()}=${value}`);
    });
  }

  // Static method to set all environment variables at once
  static setFromOptions(options: CLIOptions) {
    return new Env(options);
  }
}
