/*
 * Copyright (c) 2024 Discuzz Labs Organization
 * Licensed under the MIT License.
 * See the LICENSE file in the project root for license information.
 */
import kleur from "./kleur"

// Function to calculate terminal width and generate a line
function generateLineWithData(data: string) {
  const terminalWidth = process.stdout.columns || 80; // Default to 80 if terminal width is not available
  const totalLength = " ERROR ".length + data.length + 6; // Calculate total space taken by error, dashes, and time
  const dashesLength = terminalWidth - totalLength;
  const dashes = "─".repeat(dashesLength > 0 ? dashesLength : 0); // Create dashes to fill remaining space
  return ` ${kleur.white(dashes)} ${kleur.gray(data)}`;
}

export function formatError(error: Error) {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`; // Format HH:MM

  // Print the formatted error with the line and formatted time
  console.log("\n" + kleur.bgRed(` ERROR `) + generateLineWithData(formattedTime) + "\n" + error);
}
