import "veve";

import proxyquire from "proxyquire";

const mockCommands = {
  config: { requiresValue: true, isArray: false },
  file: { requiresValue: true, isArray: true },
  version: { requiresValue: false, isArray: false },
  help: { requiresValue: false, isArray: false },
  watch: { requiresValue: false, isArray: false },
  pattern: { requiresValue: true, isArray: true },
  output: { requiresValue: true, isArray: false },
  exclude: { requiresValue: true, isArray: true },
  timeout: { requiresValue: true, isArray: false },
  require: { requiresValue: true, isArray: true },
};

// Load `ArgsParser` with a mocked `COMMANDS` module
const { ArgsParser } = proxyquire("../dist/cli/ArgParser.js", {
  "./commands.js": { COMMANDS: mockCommands },
});

should("Test ArgParser");

it("parses single boolean flags", () => {
  const args = ["--version", "--help"];
  const parser = new ArgsParser();
  parser["parseArgs"](args);

  assert(parser.get("version")).toBe(true);
  assert(parser.get("help")).toBe(true);
});

it("parses key-value pairs", () => {
  const args = ["--config=./config.json", "--timeout=5000"];
  const parser = new ArgsParser();
  parser["parseArgs"](args);

  assert(parser.get("config")).toBe("./config.json");
  assert(parser.get("timeout")).toBe("5000");
});

it("parses array options with repeated flags", () => {
  const args = ["--file=src/index.ts", "--file=src/app.ts"];
  const parser = new ArgsParser();
  parser["parseArgs"](args);

  assert(parser.get("file")).toEqual(["src/index.ts", "src/app.ts"]);
});

run();
