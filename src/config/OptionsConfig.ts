import { CLIOptions, ConfigOptions } from "../types";
import config from "../stets.config";

export class OptionsConfig {
  // Centralized configuration for all options with details
  static optionConfig: Record<
    keyof CLIOptions | ConfigOptions,
    { requiresValue: boolean; shortValue: string }
  > = {
    config: { requiresValue: true, shortValue: "" },
    logLevel: { requiresValue: true, shortValue: "" },
    verbose: { requiresValue: false, shortValue: "" },
    // Dynamically add config keys and set requiresValue as true
    ...(Object.fromEntries(
      Object.keys(config).map((key) => [
        key as ConfigOptions,
        { 
          requiresValue: typeof config[key as ConfigOptions] !== "boolean", 
          shortValue: ""  // Initialize shortValue as an empty string
        },
      ]),
    ) as Record<ConfigOptions, { requiresValue: boolean; shortValue: string }>),
  };

  /**
   * Generates unique short options for all CLIOptions and ConfigOptions.
   * The short options are based on the first letter, and disambiguated using subsequent letters.
   */
  static generateShortOptions(): void {
    const optionKeys = Object.keys(OptionsConfig.optionConfig);
    const takenShortOptions = new Set<string>();

    optionKeys.forEach((option) => {
      let shortOption = option[0]; // Start with the first letter
      let index = 1;

      // If the first letter is taken, continue to use the next available unique letter
      while (takenShortOptions.has(shortOption)) {
        shortOption = option.slice(0, index + 1); // Incrementally take more letters
        index++;
      }

      OptionsConfig.optionConfig[option as keyof CLIOptions | ConfigOptions].shortValue = shortOption; // Set the short option
      takenShortOptions.add(shortOption); // Mark this short option as taken
    });
  }

  static normalizeFlag(flag: string): keyof CLIOptions | ConfigOptions | null {
    const normalizedFlag = flag.startsWith("--")
      ? flag.slice(2)
      : flag.startsWith("-")
        ? flag.slice(1)
        : flag;

    // Check if the normalized flag is a short option first
    const shortOptionMatch = Object.entries(OptionsConfig.optionConfig).find(
      ([_, config]) => config.shortValue === normalizedFlag
    );

    if (shortOptionMatch) {
      return shortOptionMatch[0] as keyof CLIOptions | ConfigOptions;
    }

    // Otherwise, treat it as a long option
    return normalizedFlag as keyof CLIOptions | ConfigOptions;
  }

  static get() {
    return OptionsConfig.optionConfig;
  }
}