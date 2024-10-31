export class GlobBuilder {
  convert(glob: string | RegExp): RegExp {
    if (glob instanceof RegExp) return glob;

    if (typeof glob !== "string") {
      throw new TypeError("Expected a string");
    }

    let regexString = ""; // Holds the constructed regex pattern

    for (let i = 0; i < glob.length; i++) {
      const currentChar = glob[i];

      switch (currentChar) {
        // Escape special regex characters
        case "/":
        case "$":
        case "^":
        case "+":
        case ".":
        case "(":
        case ")":
        case "=":
        case "!":
        case "|":
          regexString += `\\${currentChar}`;
          break;

        // Match any single character for `?`
        case "?":
          regexString += ".";
          break;

        // Character classes
        case "[":
        case "]":
          regexString += currentChar;
          break;

        // Handle `{}` for alternation
        case "{":
          regexString += "(";
          break;

        case "}":
          regexString += ")";
          break;

        case ",":
          regexString += regexString.endsWith("(") ? "|" : `\\${currentChar}`;
          break;

        // Handle `*` and `**` for wildcard matching
        case "*":
          const isGlobstar = glob[i + 1] === "*";
          if (isGlobstar) i++; // Skip the next '*'

          regexString += isGlobstar ? "((?:[^/]*(?:/|$))*)" : "([^/]*)";
          break;

        // Default case for literal characters
        default:
          regexString += currentChar;
      }
    }

    // Anchor regex to match the entire string
    regexString = "^" + regexString + "$";
    return new RegExp(regexString);
  }
}
