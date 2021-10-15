/**
The MIT License (MIT)

Copyright (c) 2013-2021 Bernd Amend <bernd.amend+sforth@gmail.com>

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

import * as SForthSystem from "./sforth-compiler.js"

import {existsSync} from "https://deno.land/std@0.111.0/fs/mod.ts";

// handle command line arguments
const sforthArguments = Deno.args

function loadFile(filename, includeDirectories) {
	for (const i of includeDirectories) {
		const fullfilename = i + "/" + filename
		if (existsSync(fullfilename)) {
			return new TextDecoder().decode(Deno.readFileSync(filename))
		}
	}
	throw new Error(`Could not load file ${filename}`)
}

const compilerOptions = SForthSystem.Compiler.getDefaultOptions()
compilerOptions.loadFile = loadFile

const sforth = new SForthSystem.Compiler(compilerOptions);
globalThis.SForthSystem = SForthSystem
globalThis.sforth = sforth
globalThis.loadFile = loadFile

let filename = "repl.fs"
{
	if (sforthArguments.length > 0) {
		filename = sforthArguments[sforthArguments.length - 1];

		for (let i = 0; i < sforthArguments.length - 1; i++) {
			switch (sforthArguments[i]) {
				case "--compile":
					{
						const result = sforth.compileFile(filename)
						Deno.writeFileSync(filename + ".js", new TextEncoder().encode(result.generated_code))
						self.close()
						filename = ""
						break
					}
				case "--dump":
					{
						const result = sforth.compileFile(filename)
						Deno.writeFileSync(filename + ".js", new TextEncoder().encode(result.generated_code))
						Deno.writeFileSync(filename + ".json", new TextEncoder().encode(JSON.stringify(result, null, "\t")))
						self.close()
						filename = ""
						break
					}
			}
		}
	}
}

if (filename != "") {
	const compileResult = sforth.compileFile(filename)
	const err = Deno.core.evalContext(compileResult.generated_code)[1]
	if (err !== null)
		throw err.thrown
}