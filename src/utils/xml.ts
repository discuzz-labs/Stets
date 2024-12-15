/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
/**
 * Represents the contract for an XML document writer.
 * Provides methods to build XML documents with support for tags, attributes, and content.
 */
export interface XML {
  /**
   * Opens a new XML tag with optional attributes.
   *
   * @param name - The name of the tag
   * @param attributes - Optional key-value pairs of attributes
   * @returns The XMLWriter instance for method chaining
   *
   * @example
   * writer.openTag('person', { id: 1, type: 'employee' })
   */
  openTag(name: string, attributes?: Record<string, string | number>): XML;

  /**
   * Adds a self-closing XML tag with optional attributes.
   *
   * @param name - The name of the tag
   * @param attributes - Optional key-value pairs of attributes
   * @returns The XMLWriter instance for method chaining
   *
   * @example
   * writer.selfClosingTag('image', { src: 'profile.jpg', width: 100 })
   */
  selfClosingTag(
    name: string,
    attributes?: Record<string, string | number>,
  ): XML;

  /**
   * Adds an XML tag with content and optional attributes.
   *
   * @param name - The name of the tag
   * @param content - The text content of the tag
   * @param attributes - Optional key-value pairs of attributes
   * @returns The XMLWriter instance for method chaining
   *
   * @example
   * writer.tag('name', 'John Doe', { type: 'full' })
   */
  tag(
    name: string,
    content: string,
    attributes?: Record<string, string | number>,
  ): XML;

  /**
   * Closes the most recently opened tag.
   *
   * @param name - The name of the tag to close
   * @returns The XMLWriter instance for method chaining
   *
   * @example
   * writer.openTag('person').closeTag('person')
   */
  closeTag(name: string): XML;

  /**
   * Generates the complete XML document as a string.
   *
   * @returns The full XML document
   *
   * @example
   * const xmlString = writer.toString();
   */
  toString(): string;
}

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
