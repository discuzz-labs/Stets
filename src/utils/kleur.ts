/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export default class kleur {
  private static apply(code: string, text: string | number): string {
    return `\x1b[${code}m${text}\x1b[0m`;
  }

  // Colors
  public static red(text: string | number): string {
    return this.apply("31", text);
  }

  public static bgYellow(text: string | number): string {
    return this.apply("43", text);
  }

  public static yellow(text: string | number): string {
    return this.apply("33", text);
  }
  
  public static bgBlack(text: string | number): string {
    return this.apply("40", text);
  }
  
  public static blue(text: string | number): string {
    return this.apply("34", text);
  }

  public static green(text: string | number): string {
    return this.apply("32", text);
  }

  public static white(text: string | number): string {
    return this.apply("37", text);
  }

  public static gray(text: string | number): string {
    return this.apply("90", text);
  }

  // Backgrounds
  public static bgRed(text: string | number): string {
    return this.apply("41", text);
  }

  public static bgWhite(text: string | number): string {
    return this.apply("47", text);
  }

  public static black(text: string | number): string {
    return this.apply("30", text);
  }

  // Formatting
  public static bold(text: string | number): string {
    return this.apply("1", text);
  }

  public static underline(text: string | number): string {
    return this.apply("4", text);
  }
}