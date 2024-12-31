import { Logger } from "../dist/core/Logger.js";
import { assert } from "veve";

should("Test Logger");

it("should log messages correctly", () => {
  const logger = new Logger();

  // Mocking the log method
  logger.log("Test message");

  // Assert that the log is correctly captured
  assert(logger.logs.length).toBe(1);
  assert(logger.logs[0].type).toBe("log");
  assert(logger.logs[0].args).toEqual(["Test message"]);
});

it("should log warning messages correctly", () => {
  const logger = new Logger();

  // Mocking the warn method
  logger.warn("Test warning");

  // Assert that the warning is correctly captured
  assert(logger.logs.length).toBe(1);
  assert(logger.logs[0].type).toBe("warn");
  assert(logger.logs[0].args).toEqual(["Test warning"]);
});

it("should handle timers correctly!", () => {
  const logger = new Logger();

  // Start timer
  logger.time("timer1");

  // Simulate some delay
  setTimeout(() => {
    // End timer after a short delay
    logger.timeEnd("timer1");

    // Assert timer log is created correctly
    assert(logger.logs.length).toBe(1);
    assert(logger.logs[0].type).toBe("timeEnd");
    assert(logger.logs[0].args[0]).toBe("timer1");
    assert(logger.logs[0].args[1]).toMatch(/\d+ms/); // Check if it's a duration
  }, 100); // Simulate 100ms delay
});

it("should handle groups correctly", () => {
  const logger = new Logger();

  // Start a group
  logger.group("group1");

  // Add some log entries to the group
  logger.log("Inside group");

  // End the group
  logger.groupEnd();

  // Assert the group handling works as expected
  assert(logger.logs[0].type).toBe("group");
  assert(logger.logs[0].args).toEqual(["group1"]);
  assert(logger.logs[1].type).toBe("log");
  assert(logger.logs[1].args).toEqual(["Inside group"]);
});

it("should handle assertions correctly", () => {
  const logger = new Logger();

  // Test that assertion passes
  logger.assert(true, "This should not log");

  // Test that assertion fails
  logger.assert(false, "This should log error");

  // Assert error log was created for the failed assertion
  assert(logger.logs.length).toBe(1);
  assert(logger.logs[0].type).toBe("error");
  assert(logger.logs[0].args[0]).toBe("Assertion failed:");
  assert(logger.logs[0].args[1]).toBe("This should log error");
});

run();
