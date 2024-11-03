import { writeFileSync, mkdirSync } from "fs"; // Importing writeFileSync and mkdirSync
import path from "path";
import { SuiteReport } from "../framework/Suite";
import kleur from "../utils/kleur";

export class WriteReporter {
  readonly extension: string = ".txt"; // default

  constructor(
    public results: SuiteReport | null = null,
    public summary: {
      passed: number;
      failed: number;
      duration: number;
    } | null = null,
  ) {}

  // Method to format the report including the summary
  public format(filePath: string): string {
    const formattedReport = {
      file: filePath,
      results: this.results,
      summary: this.summary,
    };

    return JSON.stringify(formattedReport, null, 2); // Returning formatted JSON string
  }

  // Method to write the report synchronously
  public write(file: string, dir: string) {
    const outputDir = path.join(process.cwd(), dir);
    const outputFile = path.join(outputDir, `${path.basename(file)}.${this.extension}`);

    try {
      // Create the directory if it doesn't exist
      mkdirSync(outputDir, { recursive: true });

      // Format the data
      const formattedData = this.format(outputFile);

      // Write the formatted data to the file synchronously
      writeFileSync(outputFile, formattedData);

      console.log(`\n${kleur.bgWhite("🍾")} Report written to ${outputFile}`);
    } catch (err) {
      console.error(`\n${kleur.bgRed("🥊")} Failed to write report: ${err}`);
    }
  }
}
