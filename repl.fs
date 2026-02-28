// SPDX-License-Identifier: MIT

include "forth.fs"
include »console.fs«

»sforth, Copyright (C) 2013-2026 Bernd Amend <typescript@berndamend.de>
Type `bye' to exit\n« .

2000 { cmd_history_save_size }

: bye ( -- )
    "\n" .
	\ save the cmd_history
	\ this won't handle concurrent instances
	cmd_history.size cmd_history_save_size - { remove_element_count }
	remove_element_count 0> if
		0 remove_element_count cmd_history.stac.splice(2);
	endif
	".sforth_history" cmd_history.toJSON() Deno.writeTextFileSync(2)
	0 process.exit(1);
	;

"" { entered }

0 { cmd_last_pos }
0 { cmd_cursor_pos }
new SForthStack { cmd_history }

try
	".sforth_history" Deno.readTextFileSync(1) cmd_history.fromJSON(1);
catch err
endtry

: forthconsole {} ;
null to forthconsole.onKey

:async handleKey { key }
	key "\u0003" === if
		\ Control-C was pressed
		\ restore console handler
		null to forthconsole.onKey
	elseif ' forthconsole.onKey null <> if
		key forthconsole.onKey await;
	elseif key "\u007f" === key "\b" === || if
		\ Backspace was pressed
		cmd_cursor_pos 0> if
			0 cmd_cursor_pos 1- entered.slice(2)
			cmd_cursor_pos entered.length entered.slice(2) + to entered
			cmd_cursor_pos 1- to cmd_cursor_pos
			clearcurrentline
			entered.length 0> if entered . endif
			entered.length cmd_cursor_pos - { diff }
			diff 0> if
				»\u001B[${diff}D« type
			endif
		endif
	elseif key "\r" === key "\n" === || if
		entered.length cmd_cursor_pos - { diff }
		diff 0> if
			»\u001B[${diff}C« type
		endif
		" " type
		entered "" !== if
			entered cmd_history.push
		endif
		0 to cmd_last_pos
		0 to cmd_cursor_pos

		try
			entered
			»« to entered
			// TODO this code should block the console until the operation as completed.
			sforth.eval(1) await;
			' forthconsole.onKey null === if
				» ok\n« type
			endif
		catch e
			`\n${SForthSystem.demangle(e.stack)}\n` .
		endtry

	elseif 0 key.charCodeAt 27 = if
		1 key.charCodeAt 91 = if
			2 key.charCodeAt case

				of 65 \ up
					cmd_last_pos 0= if
						cmd_last_pos cmd_history.get count 0<> if
							»« cmd_history.push(1);
						endif
					endif
					cmd_last_pos cmd_history.size 1- < if
						cmd_last_pos 1+ to cmd_last_pos
					endif
					cmd_history.size 0> if
						clearcurrentline cmd_last_pos cmd_history.get to entered
						entered.length to cmd_cursor_pos
					endif
					entered .
				endof

				of 66 \ down
					cmd_last_pos 0> if
						cmd_last_pos 1- to cmd_last_pos
					endif
					cmd_history.size 0> if
						clearcurrentline cmd_last_pos cmd_history.get to entered
						entered.length to cmd_cursor_pos
					endif
					entered .
					cmd_last_pos 0= if
						entered count 0<> if
							»« cmd_history.push(1);
						endif
					endif
				endof

				of 68 \ left
					cmd_cursor_pos 0> if
						cmd_cursor_pos 1- to cmd_cursor_pos
						"\u001B[1D" type
					endif
				endof

				of 67 \ right
					cmd_cursor_pos entered.length < if
						cmd_cursor_pos 1+ to cmd_cursor_pos
						"\u001B[1C" type
					endif
				endof

				of 72 \ home (Pos1)
					cmd_cursor_pos 0> if
						»\u001B[${cmd_cursor_pos}D« type
						0 to cmd_cursor_pos
					endif
				endof

				of 70 \ end (Ende)
					cmd_cursor_pos entered.length < if
						entered.length cmd_cursor_pos - { diff }
						»\u001B[${diff}C« type
						entered.length to cmd_cursor_pos
					endif
				endof

				of 51 \ delete
					3 key.charCodeAt 126 = if
						cmd_cursor_pos entered.length < if
							0 cmd_cursor_pos entered.slice(2)
							cmd_cursor_pos 1+ entered.length entered.slice(2) + to entered
							clearcurrentline
							entered.length 0> if entered . endif
							entered.length cmd_cursor_pos - { diff }
							diff 0> if
								»\u001B[${diff}D« type
							endif
						endif
					endif
				endof

				default
			endcase
		endif
	else
		// If a user copies a string with new lines into the repl we are
		// only called once.
		"\r" "\n" key.replaceAll { clean_key }
		cmd_cursor_pos entered.length === if
			clean_key type
			entered clean_key + to entered
			cmd_cursor_pos clean_key.length + to cmd_cursor_pos
		else
			0 cmd_cursor_pos entered.slice(2) clean_key + cmd_cursor_pos entered.length entered.slice(2) + to entered
			cmd_cursor_pos clean_key.length + to cmd_cursor_pos
			clearcurrentline
			entered .
			entered.length cmd_cursor_pos - { diff }
			diff 0> if
				»\u001B[${diff}D« type
			endif
		endif
	endif
;

true process.stdin.setRawMode(1);
process.stdin.resume(0);
"utf8" process.stdin.setEncoding(1);
"data" ' handleKey process.stdin.on(2); \ register the key handling function
