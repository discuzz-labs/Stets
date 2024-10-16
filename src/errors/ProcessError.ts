import kleur from "kleur";

export class ProcessError extends Error {
  public path: string;
  constructor({ path, message }: { path: string; message: string }) {
    super(message); // Initialize the Error class
    this.path = path;
  }

  toString() {
    return (
      `\n${kleur.bgRed(" PROCESS ERROR ")} at ${kleur.red(this.path)}\n` +
      this.message
    );
  }
}
