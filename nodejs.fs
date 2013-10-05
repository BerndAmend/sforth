(
The MIT License (MIT)

Copyright (c) 2013 Bernd Amend <bernd.amend+sforth@gmail.com>

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
)

include " console.fs "
include forth.fs
include time.fs
include filesystem.fs
include process.fs
include serial.fs

include pdfkit.fs

." sforth, Copyright (C) 2013 Bernd Amend <bernd.amend@gmail.com>\n "
." Type `bye' to exit\n "

true process.stdin.setRawMode drop
process.stdin.resume drop
" utf8 " process.stdin.setEncoding drop

: bye ( -- ) 0 process.exit drop ;

" " value entered

\ TODO: load and save cmd_history
0 value cmd_last_pos
new ForthStack value cmd_history

"data
:jsnoname { key }
\ 0 key.charCodeAt . key.length .
key " \u0003 " === if
	\ Control-C was pressed
else 0 key.charCodeAt 27 = if
	1 key.charCodeAt 91 = if
		2 key.charCodeAt 65 = if \ up
		cmd_history.size 0> if
			clearcurrentline
			cmd_last_pos cmd_history.get dup to entered .
		endif
		cmd_last_pos cmd_history.size 1- < if
			cmd_last_pos 1+ to cmd_last_pos
		endif
		endif

		2 key.charCodeAt 66 = if \ down
		cmd_history.size 0> if
			clearcurrentline
			cmd_last_pos cmd_history.get dup to entered .
		endif
		cmd_last_pos 0> if
			cmd_last_pos 1- to cmd_last_pos
		endif
		endif

		2 key.charCodeAt 68 = if \ left
		endif
		2 key.charCodeAt 67 = if \ right
		endif
	endif
else key " \u007f " === if
	\ Backspace was pressed
	entered.length 0> if
	0 entered.length 1- entered.substr to entered
	clearcurrentline
	entered.length 0> if entered . endif
	endif
else key " \r " === key " \n " === or if
	."   "
  \ TODO: add try catch
  entered cmd_history.push
  0 to cmd_last_pos
  entered
  :[ try {
	compile(stack);
	entered = "";
	jseval(stack);
	stack.push(" ok\n");
	print(stack);
	} catch(e) {
		console.error("\n" + e.stack);
	} ]:d
  " " to entered
else
	key type
	entered key + to entered
endif
endif
endif
endif
;
process.stdin.on drop \ register the key handling function
