/**
The MIT License (MIT)

Copyright (c) 2013-2023 Bernd Amend <bernd.amend+sforth@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import * as SForthSystem from "./sforth-compiler.ts";

declare const globalThis: any;

function loadFile(filename: string, includeDirectories: string[]) {
  for (const i of includeDirectories) {
    const fullfilename = i + "/" + filename;
    try {
      return new TextDecoder("utf-8").decode(Deno.readFileSync(fullfilename));
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
