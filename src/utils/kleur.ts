/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export default class kleur {
  // Flag to indicate if colors should be disabled
  private static colorsDisabled: boolean = false;

  // Check if FORCE_COLOR is set to 0 or -no-color is in process.argv
  static initialize() {
    const forceColor = process.env.FORCE_COLOR;
    const noColorArg = process.argv.includes('-no-color');

    if (forceColor === '0' || noColorArg) {
      this.colorsDisabled = true;
    }
  }

  // Function to apply the color if not disabled
  private static apply(code: string, text: string | number): string {
    if (this.colorsDisabled) {
      return String(text);  // Return plain text if colors are disabled
    }
    return `\x1b[${code}m${text}\x1b[0m`;
  }

  //cyan colors
  public static cyan(text: string | number): string {
    return this.apply("36", text);
  }

  // Red colors
  public static red(text: string | number): string {
    return this.apply("31", text);
  }

  public static bgRed(text: string | number): string {
    return this.apply("41", text);
  }

  // Yellow colors
  public static yellow(text: string | number): string {
    return this.apply("33", text);
  }

  public static bgYellow(text: string | number): string {
    return this.apply("43", text);
  }

  // Green colors
  public static green(text: string | number): string {
    return this.apply("32", text);
  }

  public static bgGreen(text: string | number): string {
      return this.apply("42", text);
  }
  
  // Blue colors
  public static blue(text: string | number): string {
    return this.apply("34", text);
  }

  // Black colors
  public static black(text: string | number): string {
    return this.apply("30", text);
  }

  public static bgBlack(text: string | number): string {
    return this.apply("40", text);
  }

  // White colors
  public static white(text: string | number): string {
    return this.apply("37", text);
  }

  public static bgWhite(text: string | number): string {
    return this.apply("47", text);
  }

  // Gray colors
  public static gray(text: string | number): string {
    return this.apply("90", text);
  }

  // Formatting
  public static bold(text: string | number): string {
    return this.apply("1", text);
  }

  public static underline(text: string | number): string {
    return this.apply("4", text);
  }
}


// Initialize the color detection when the class is imported or used
kleur.initialize();
