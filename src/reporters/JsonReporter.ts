import { SuiteReport } from "../framework/Suite";
import { WriteReporter } from "./WriterReporter";

export class JsonReporter extends WriteReporter {
  readonly extension: string = "json";

  constructor(
    public results: SuiteReport | null = null,
    public summary: {
      passed: number;
      failed: number;
      duration: number;
    } | null = null,
  ) {
    super(results, summary);
  }

  public format(filePath: string) {
    const formattedReport = {
      file: filePath,
      report: this.results,
      summary: this.summary,
    };

    return JSON.stringify(formattedReport, null, 2);
  }
}
