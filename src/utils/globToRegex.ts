export function globToRegex(glob: string | RegExp ) : RegExp {
  if(glob instanceof RegExp) return glob
  
  if (typeof glob !== 'string') {
    throw new TypeError('Expected a string');
  }

  var str = String(glob);
  var reStr = "";
  var extended = true;
  var globstar = true;
  var inGroup = false;
  var flags = "";
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
        reStr += "\\" + c;
        break;

      case "?":
        if (extended) {
          reStr += ".";
          break;
        }

      case "[":
      case "]":
        if (extended) {
          reStr += c;
          break;
        }

      case "{":
        if (extended) {
          inGroup = true;
          reStr += "(";
          break;
        }

      case "}":
        if (extended) {
          inGroup = false;
          reStr += ")";
          break;
        }

      case ",":
        if (inGroup) {
          reStr += "|";
          break;
        }
        reStr += "\\" + c;
        break;

      case "*":
        var prevChar = str[i - 1];
        var starCount = 1;
        while (str[i + 1] === "*") {
          starCount++;
          i++;
        }
        var nextChar = str[i + 1];

        if (!globstar) {
          reStr += ".*";
        } else {
          var isGlobstar = starCount > 1 &&
            (prevChar === "/" || prevChar === undefined) &&
            (nextChar === "/" || nextChar === undefined);

          if (isGlobstar) {
            reStr += "((?:[^/]*(?:\/|$))*)";
            i++;
          } else {
            reStr += "([^/]*)";
          }
        }
        break;

      default:
        reStr += c;
    }
  }

  if (!flags || !~flags.indexOf('g')) {
    reStr = "^" + reStr + "$";
  }

  return new RegExp(reStr, flags);
}
