import * as fs from 'fs';
import * as path from 'path';
import { Reporter } from './Reporter';
import { PoolResult } from '../core/Pool';
import { ErrorInspect, ErrorInspectOptions } from '../core/ErrorInspect';
import kleur from 'kleur';

class XMLWriter {
  private buffer: string[] = [];
  private indent: number = 1;

  constructor() {
    this.buffer.push('<?xml version="1.0" encoding="UTF-8"?>');
  }

  /**
   * Add an opening tag with optional attributes
   */
  openTag(name: string, attributes: Record<string, string | number> = {}) {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${this.escapeXml(value.toString())}"`)
      .join(' ');

    const indentStr = '  '.repeat(this.indent);
    this.buffer.push(`${indentStr}<${name}${attrs ? ' ' + attrs : ''}>`);
    this.indent++;
    return this;
  }

  /**
   * Add a self-closing tag with attributes
   */
  selfClosingTag(name: string, attributes: Record<string, string | number> = {}) {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${this.escapeXml(value.toString())}"`)
      .join(' ');

    const indentStr = '  '.repeat(this.indent);
    this.buffer.push(`${indentStr}<${name}${attrs ? ' ' + attrs : ''} />`);
    return this;
  }

  /**
   * Add a tag with content
   */
  tag(name: string, content: string, attributes: Record<string, string | number> = {}) {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${this.escapeXml(value.toString())}"`)
      .join(' ');

    const indentStr = '  '.repeat(this.indent);
    this.buffer.push(`${indentStr}<${name}${attrs ? ' ' + attrs : ''}>${this.escapeXml(content)}</${name}>`);
    return this;
  }

  /**
   * Close the most recent tag
   */
  closeTag(name: string) {
    this.indent--;
    const indentStr = '  '.repeat(this.indent);
    this.buffer.push(`${indentStr}</${name}>`);
    return this;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (match) => {
      switch(match) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return match;
      }
    });
  }

  /**
   * Generate final XML string
   */
  toString(): string {
    return this.buffer.join('\n');
  }
}

export interface junit extends Reporter {}

/**
 * Generates a JUnit XML report for the provided test results.
 * 
 * @returns {Promise<void>} Resolves when the XML report is successfully written to a file.
 */
export const junit: junit  = {
  name: "junitReporter",
  type: "file",

   
    report: async function (options: {
      reports: Map<string, PoolResult>;
      outputDir: string;
    }) {
      const writer = new XMLWriter();
      writer.openTag("testsuites");

      for (const [file, { error, duration, report, sourceMap }] of options.reports) {
        if(report) {
        writer.openTag("testsuite", {
          name: file,
          time: duration, // Convert duration to seconds.
          tests: report?.stats.total,
          failures: report?.stats.failed,
          skipped: report?.stats.skipped,
        });
        for (const test of report.tests) {
          writer.openTag("testcase", {
            name: test.description,
            classname: file,
            time: test.duration,
          });

          if (test.status === "failed" && test.error) {
            writer.openTag("failure", { message: ErrorInspect.format({ error: test.error, file, sourceMap }) });
            writer.closeTag("failure");
          }

          if (test.status === "skipped") {
            writer.selfClosingTag("skipped");
          }

          writer.closeTag("testcase");
        }
        }
        
        if (error) {
          writer.openTag("system-err");
          writer.tag("![CDATA[", error({error, file }));
          writer.closeTag("system-err");
        }

        writer.closeTag("testsuite");
      }

      writer.closeTag("testsuites");

      // Write the XML report to the specified directory.
      const outputPath = path.join(options.outputDir, "junit-report.xml");
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.promises.writeFile(outputPath, writer.toString());

      console.log(`${kleur.green("✓")} JUnit report generated at ${outputPath}`);
    },
  }
