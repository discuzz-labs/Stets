import { Isolated } from "../dist/core/Isolated.js";
import { Script, createContext } from "vm";
import { assert } from "veve";

should("Test Isolated");

it("injects required modules into the code", () => {
  const isolated = new Isolated({
    file: "test.js",
    requires: ["moduleA", "moduleB"],
  });

  const code = `console.log("Hello World");`;
  const injectedCode = isolated.injectRequires(code);

  assert(injectedCode).toEqual(
    `require("moduleA")\nrequire("moduleB")\nconsole.log("Hello World");`,
  );
});

it("creates a script with injected requires", () => {
  const isolated = new Isolated({
    file: "test.js",
    requires: ["moduleA"],
  });

  const code = `console.log("Test");`;
  const script = isolated.script(code);

  assert(script).toBeInstanceOf(Script);
});

it("executes a script in a new context and validates the result", async () => {
  const isolated = new Isolated({
    file: "test.js",
    requires: [],
  });

  const stats = {
    total: 1,
    skipped: 0,
    passed: 1,
    failed: 0,
    softfailed: 0,
    todo: 0,
  };

  const testResult = {
    description: "Test case description",
    status: "passed",
    retries: 0,
    duration: 5,
    bench: null,
  };

  const hookResult = {
    description: "beforeEach",
    status: "passed",
    retries: 0,
    duration: 1,
    bench: null,
  };

  const report = {
    stats,
    description: "Test suite description",
    status: "passed",
    tests: [testResult],
    hooks: [hookResult],
  };

  const validateReport = isolated.isValidReport(report);
  assert(validateReport).toBe(true);
});

it("handles execution errors gracefully", async () => {
  const isolated = new Isolated({
    file: "test.js",
    requires: [],
  });

  const mockContext = createContext({});
  const script = new Script(`throw new Error("Test Error");`);

  const execResult = await isolated.exec({
    script,
    context: mockContext,
    timeout: 1000,
  });

  assert(execResult.status).toBe(false);
  assert(execResult.error).toBeInstanceOf(Error);
  assert(execResult.error.message).toBe("Test Error");
  assert(execResult.report).toBe(null);
});

run();
