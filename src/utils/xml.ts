/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

export class XML {
  private buffer: string[] = [];
  private indent: number = 1;

  constructor() {
    this.buffer.push('<?xml version="1.0" encoding="UTF-8"?>');
  }

  openTag(name: string, attributes: Record<string, string | number> = {}) {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${this.escapeXml(value.toString())}"`)
      .join(" ");

    const indentStr = "  ".repeat(this.indent);
    this.buffer.push(`${indentStr}<${name}${attrs ? " " + attrs : ""}>`);
    this.indent++;
    return this;
  }

  selfClosingTag(
    name: string,
    attributes: Record<string, string | number> = {},
  ) {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${this.escapeXml(value.toString())}"`)
      .join(" ");

    const indentStr = "  ".repeat(this.indent);
    this.buffer.push(`${indentStr}<${name}${attrs ? " " + attrs : ""} />`);
    return this;
  }

  tag(
    name: string,
    content: string,
    attributes: Record<string, string | number> = {},
  ) {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${this.escapeXml(value.toString())}"`)
      .join(" ");

    const indentStr = "  ".repeat(this.indent);
    this.buffer.push(
      `${indentStr}<${name}${attrs ? " " + attrs : ""}>${this.escapeXml(content)}</${name}>`,
    );
    return this;
  }

  closeTag(name: string) {
    this.indent--;
    const indentStr = "  ".repeat(this.indent);
    this.buffer.push(`${indentStr}</${name}>`);
    return this;
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (match) => {
      switch (match) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return match;
      }
    });
  }

  toString(): string {
    return this.buffer.join("\n");
  }
}
