(
The MIT License (MIT)

Copyright (c) 2013-2014 Bernd Amend <bernd.amend+sforth@gmail.com>

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

include "forth.fs
include »console.fs«
include time.fs
include filesystem.fs
include process.fs
\ include serial.fs

\ include pdfkit.fs

»sforth, Copyright (C) 2013-2014 Bernd Amend <bernd.amend+sforth@gmail.com>\n«
»Type `bye' to exit\n« + .

true process.stdin.setRawMode drop
process.stdin.resume drop
"utf8 process.stdin.setEncoding drop

2000 to cmd_history_save_size

: bye ( -- )
	\ save the cmd_history
	\ this won't handle concurrent instances
	cmd_history.size cmd_history_save_size - { remove_element_count }
	remove_element_count 0> if
		:[ cmd_history.stac.splice(0, remove_element_count) ];
	endif
	".sforth_history cmd_history.toJSON writeFileSync
	0 process.exit drop ;

»« value entered

0 value cmd_last_pos
new ForthStack value cmd_history

try
	".sforth_history readFileSync cmd_history.fromJSON
catch err
endtry

: forthconsole ;
null to forthconsole.onKey

"data
:jsnoname { key }
	key "\u0003 === if
		\ Control-C was pressed
		\ restore console handler
		null to forthconsole.onKey
	elseif ' forthconsole.onKey null <> if
		key forthconsole.onKey
	elseif key "\u007f === if
		\ Backspace was pressed
		entered.length 0> if
			0 entered.length 1- entered.substr to entered
		clearcurrentline
			entered.length 0> if entered . endif
		endif
	elseif key "\r === key "\n === || if
		» « type
		entered cmd_history.push
		0 to cmd_last_pos
		entered

		try
			compile
			»« to entered
			eval
			» ok\n« type
		catch e
			"\n  e.stack + .
		endtry

	elseif 0 key.charCodeAt 27 = if
		1 key.charCodeAt 91 = if
			2 key.charCodeAt case
				of 65 \ up
					cmd_history.size 0> if
						clearcurrentline
						cmd_last_pos cmd_history.get dup to entered .
					endif
					cmd_last_pos cmd_history.size 1- < if
						cmd_last_pos 1+ to cmd_last_pos
					endif
				endof

				of 66 \ down
					cmd_history.size 0> if
						clearcurrentline
						cmd_last_pos cmd_history.get dup to entered .
					endif
					cmd_last_pos 0> if
						cmd_last_pos 1- to cmd_last_pos
					endif
				endof

				of 68 \ left
				endof

				of 67 \ right
				endof

				default
			endcase
		endif
	else
		// If a user copies a string with new lines into the repl we are
		// only called once.
		"\r "\n key.replaceAll type
		entered key + to entered
	endif
;
process.stdin.on drop \ register the key handling function

