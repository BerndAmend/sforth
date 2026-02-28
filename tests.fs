// SPDX-License-Identifier: MIT

include "forth.fs"
include »console.fs«

:[ Deno.readDirSync("tests").toArray().map(v => v.name) ]: { test-files }

:async doit {}
0 test-files.length 1 do i
	"tests/" i test-files @ + { filename }
	".fs" filename.endsWith(1) not if continue endif
	`Execute ${filename}\n` .
	filename Deno.readTextFileSync(1) { file }
	file.toString(0) filename sforth.eval(2) await;
loop
;

doit(0) await;

»Done\n« .
