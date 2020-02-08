/*
The MIT License (MIT)

Copyright (c) 2013-2020 Bernd Amend <bernd.amend+sforth@gmail.com>

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

include "forth.fs"
include »console.fs«
include "filesystem.fs"

"tests" Filesystem.readdirSync(1) { test-files }

0 test-files.length 1 do i
		"tests/" i test-files @ + { filename }
		".fs" filename.endsWith(1) not if continue endif
		»Execute « filename + . cr
		filename readFileSync { file }
		file.toString(0) sforth.compile { res } res.generated_code vm.runInThisContext(1);
loop

»Done\n« .
