// SPDX-License-Identifier: MIT

import * as SForthSystem from "./sforth-compiler.ts";

declare const globalThis: any;

function loadFile(filename: string, includeDirectories: string[]) {
  for (const i of includeDirectories) {
    const fullfilename = i + "/" + filename;
    try {
      return {
        fullfilename,
        content: Deno.readTextFileSync(fullfilename),
      };
    } catch {
      // we just ignore the error
    }
  }
  throw new Error(`Could not load file ${filename}`);
}

const compilerOptions = SForthSystem.Compiler.getDefaultOptions();
compilerOptions.checkStack = true;
compilerOptions.loadFile = loadFile;

const sforth = new SForthSystem.Compiler(compilerOptions);
globalThis.loadFile = loadFile;
globalThis.sforth = sforth;
globalThis.SForthSystem = SForthSystem;
globalThis.stack = new SForthSystem.SForthStack();
globalThis.SForthStack = SForthSystem.SForthStack;

let filename = "repl.fs";
{
  if (Deno.args.length > 0) {
    filename = Deno.args[Deno.args.length - 1];

    for (let i = 0; i < Deno.args.length - 1; i++) {
      switch (Deno.args[i]) {
        case "--compile": {
          const result = sforth.compileFile(filename);
          Deno.writeFileSync(
            filename + ".js",
            new TextEncoder().encode(result.generated_code![0].code),
          );
          Deno.exit(0);
          break;
        }
        case "--dump": {
          const result = sforth.compileFile(filename);
          Deno.writeFileSync(
            filename + ".js",
            new TextEncoder().encode(result.generated_code![0].code),
          );
          Deno.writeFileSync(
            filename + ".json",
            new TextEncoder().encode(JSON.stringify(result, null, "\t")),
          );
          Deno.exit(0);
          break;
        }
      }
    }
  }
}

await sforth.evalFile(filename);
