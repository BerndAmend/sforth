/**
The MIT License (MIT)

Copyright (c) 2013-2022 Bernd Amend <bernd.amend+sforth@gmail.com>

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

import * as SForthSystem from "./sforth-compiler.js";

import * as vm from "vm";
import * as util from "util";
import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import * as url from "url";
import * as process from "process";

declare const globalThis: any;
declare const Deno: any;

globalThis.SForthSystem = globalThis.SForthSystem || SForthSystem;
globalThis.fs = globalThis.fs || fs;
globalThis.vm = globalThis.vm || vm;
globalThis.util = globalThis.util || util;
globalThis.http = globalThis.http || http;
globalThis.path = globalThis.path || path;
globalThis.url = globalThis.url || url;
globalThis.process = globalThis.process || process;

// handle command line arguments
let sforthArguments = [];

if (typeof Deno !== "undefined") {
  sforthArguments = Deno.args;
} else {
  //for (let i = 2; i < process.argv.length; i += 1) {
  //  console.log(`${i} ${process.argv[i]}`);
  // if (("file://" + process.argv[i]) == import.meta.url) {
  sforthArguments = process.argv.slice(2);
  //   break;
  // }
  //}
}

function loadFile(filename: string, includeDirectories: string[]) {
  for (const i of includeDirectories) {
    const fullfilename = i + "/" + filename;
    try {
      return fs.readFileSync(fullfilename).toString();
    } catch {
      // we just ignore the error
    }
  }
  throw new Error(`Could not load file ${filename}`);
}

const compilerOptions = SForthSystem.Compiler.getDefaultOptions();
compilerOptions.loadFile = loadFile;

const sforth = new SForthSystem.Compiler(compilerOptions);
globalThis.loadFile = loadFile;
globalThis.sforth = sforth;

let filename = "repl.fs";
{
  if (sforthArguments.length > 0) {
    filename = sforthArguments[sforthArguments.length - 1];

    for (let i = 0; i < sforthArguments.length - 1; i++) {
      switch (sforthArguments[i]) {
        case "--compile": {
          const result = sforth.compileFile(filename);
          fs.writeFileSync(filename + ".js", result.generated_code!);
          filename = "";
          break;
        }
        case "--dump": {
          const result = sforth.compileFile(filename);
          fs.writeFileSync(filename + ".js", result.generated_code!);
          fs.writeFileSync(
            filename + ".json",
            JSON.stringify(result, null, "\t"),
          );
          filename = "";
          break;
        }
      }
    }
  }
}

if (filename != "") {
  const compileResult = sforth.compileFile(filename);
  if (typeof Deno !== "undefined") {
    // @ts-ignore: Deno.core has no typescript type information
    const err = Deno.core.evalContext(compileResult.generated_code!)[1];
    if (err !== null) {
      throw err.thrown;
    }
  } else {
    vm.runInThisContext(compileResult.generated_code!, {});
  }
}
