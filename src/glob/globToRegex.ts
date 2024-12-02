export function globToRegex(glob: string | RegExp): RegExp {
    if (typeof glob !== "string") {
      throw new TypeError("Expected a string");
    }

    var str = String(glob);

    // This will hold the regular expression pattern as a string.
    var reStr = "";

    var extended = true;

    // `globstar` behavior:
    // - `/foo/*` becomes `^\/foo\/[^/]*$`, matching any path starting with `/foo/` that doesn’t have another `/` after it.
    // For example:
    // - `/foo/*` matches `/foo/bar` and `/foo/bar.txt` but not `/foo/bar/baz` or `/foo/bar/baz.txt`.
    // - `/foo/**` with `globstar` enabled behaves like `/foo/*` when `globstar` is disabled.
    var globstar = true;

    // Track if we're inside a group (like `{*.html,*.js}`) for extended matching.
    var inGroup = false;

    var c;
    for (var i = 0, len = str.length; i < len; i++) {
      c = str[i];

      switch (c) {
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
          reStr += "\\" + c; // Escape special regex characters
          break;

        case "?":
          if (extended) {
            reStr += "."; // `?` matches any single character if extended globbing is enabled
            break;
          }

        case "[":
        case "]":
          if (extended) {
            reStr += c; // Preserve square brackets for character classes if extended globbing is enabled
            break;
          }

        case "{":
          if (extended) {
            inGroup = true;
            reStr += "("; // Start a group for `{a,b}` patterns
            break;
          }

        case "}":
          if (extended) {
            inGroup = false;
            reStr += ")"; // Close the group for `{a,b}` patterns
            break;
          }

        case ",":
          if (inGroup) {
            reStr += "|"; // Use `|` as a separator within groups `{a,b}`
            break;
          }
          reStr += "\\" + c; // Escape comma if not in a group
          break;

        case "*":
          // Count consecutive "*" characters and determine if we have a globstar pattern
          var prevChar = str[i - 1];
          var starCount = 1;
          while (str[i + 1] === "*") {
            starCount++;
            i++;
          }
          var nextChar = str[i + 1];

          if (!globstar) {
            // When `globstar` is disabled, treat any number of "*" as `.*`
            reStr += ".*";
          } else {
            // `globstar` is enabled, so decide if this is a globstar pattern
            var isGlobstar =
              starCount > 1 && // Multiple "*"
              (prevChar === "/" || prevChar === undefined) && // At the start of a segment
              (nextChar === "/" || nextChar === undefined); // At the end of a segment

            if (isGlobstar) {
              // Match zero or more path segments
              reStr += "((?:[^/]*(?:/|$))*)";
              i++; // Move past the "/"
            } else {
              // Not a globstar, so match a single path segment
              reStr += "([^/]*)";
            }
          }
          break;

        default:
          reStr += c; // Add any regular characters as they are
      }
    }

    reStr = "^" + reStr + "$";

    return new RegExp(reStr);
  }
