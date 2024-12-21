import { Console } from "../dist/core/Console.js";
import "veve";

should("Test Console");

it("should log messages correctly", () => {
  const console = new Console();

  // Mocking the log method
  console.log("Test message");

  // Assert that the log is correctly captured
  assert(console.logs.length).toBe(1);
  assert(console.logs[0].type).toBe("log");
  assert(console.logs[0].args).toEqual(["Test message"]);
});

it("should log warning messages correctly", () => {
  const console = new Console();

  // Mocking the warn method
  console.warn("Test warning");

  // Assert that the warning is correctly captured
  assert(console.logs.length).toBe(1);
  assert(console.logs[0].type).toBe("warn");
  assert(console.logs[0].args).toEqual(["Test warning"]);
});

it("should handle timers correctly", () => {
  const console = new Console();

  // Start timer
  console.time("timer1");

  // Simulate some delay
  setTimeout(() => {
    // End timer after a short delay
    console.timeEnd("timer1");

    // Assert timer log is created correctly
    assert(console.logs.length).toBe(1);
    assert(console.logs[0].type).toBe("timeEnd");
    assert(console.logs[0].args[0]).toBe("timer1");
    assert(console.logs[0].args[1]).toMatch(/\d+ms/); // Check if it's a duration
  }, 100); // Simulate 100ms delay
});

it("should handle groups correctly", () => {
  const console = new Console();

  // Start a group
  console.group("group1");

  // Add some log entries to the group
  console.log("Inside group");

  // End the group
  console.groupEnd();

  // Assert the group handling works as expected
  assert(console.logs[0].type).toBe("group");
  assert(console.logs[0].args).toEqual(["group1"]);
  assert(console.logs[1].type).toBe("log");
  assert(console.logs[1].args).toEqual(["Inside group"]);
});

it("should handle assertions correctly", () => {
  const console = new Console();

  // Test that assertion passes
  console.assert(true, "This should not log");

  // Test that assertion fails
  console.assert(false, "This should log error");

  // Assert error log was created for the failed assertion
  assert(console.logs.length).toBe(1);
  assert(console.logs[0].type).toBe("error");
  assert(console.logs[0].args[0]).toBe("Assertion failed:");
  assert(console.logs[0].args[1]).toBe("This should log error");
});

run();
