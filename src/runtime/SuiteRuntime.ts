import { SuiteCase } from "../types";
import { Script, createContext } from "vm";
import { SuiteRunner } from "../lib/SuiteRunner";
import { Console } from "console";

export class SuiteRuntime {
  constructor() {}

  /**
   * Runs the SuiteRunner in a new VM context.
   * @param suiteCase - The suite case to run in the VM.
   * @returns A promise that resolves to the updated suiteCase.
   */
  async runInProcess(suiteCase: SuiteCase): Promise<SuiteCase> {
    return new Promise((resolve, reject) => {
      try {
        // Create a VM context to run the code in isolation
        const vmContext = {
          suiteCase,  // Pass the suiteCase into the VM context
          require,    // Optionally expose require if external modules are needed
          SuiteRunner, // Expose SuiteRunner to the VM
          console
        };

        // Create the isolated context
        const context = createContext(vmContext);

        // The script that runs the suite logic (replace this with your actual SuiteRunner logic)
        const scriptCode = `
         (async () => {
            const suiteRunner = new SuiteRunner();
            await suiteRunner.runSuite(suiteCase);
          })();
        `;

        // Create a new script with the code to execute the suite
        const script = new Script(scriptCode);

        // Run the script in the VM context
        const result = script.runInContext(context);

        // Resolve the promise once the tests are finished
        result
          .then((updatedSuiteCase: SuiteCase) => {
            resolve(updatedSuiteCase);
          })
          .catch(reject);
      } catch (error) {
        // If an error occurs during execution, reject the promise
        reject(error);
      }
    });
  }
}