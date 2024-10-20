/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */

import kleur from "./kleur";

type Callback = (err: Error | null, content: string) => void;

interface ParsedStack {
  file: string;
  methodName: string;
  arguments: string[];
  lineNumber: number;
  column: number | null;
}

export class ErrorFormatter {
  private nodeRe =
    /^\s*at (?!new Script) ?(?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;

  parseStack(line: string): ParsedStack | null {
    const parts = this.nodeRe.exec(line);
    if (!parts) return null;

    return {
      file: parts[2],
      methodName: parts[1] || "<UNKNOWN>",
      arguments: [],
      lineNumber: +parts[3],
      column: parts[4] ? +parts[4] : null,
    };
  }

  format(message: string, stackTrace: string) {
    console.log(message)
    const stack = stackTrace.split("\n")
    stack?.forEach(line => {
      const parsed = this.parseStack(line)
      if(parsed){
        console.log(`${kleur.gray("at")} ${parsed.file} :${parsed.lineNumber}:${parsed.column} `)
      }
    })
  }
}
