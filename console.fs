// SPDX-License-Identifier: MIT

// this file expects that you have already define a console-low-level-type function
:async automatically-determine-console-low-level-type {}
	typeof console-low-level-type "function" !== if
		"node:process" import await to globalThis.process
		"node:util" import await to globalThis.util

		// automatically define console-low-level-type if node.js or deno are used
		:noname { x -- }
			' x process.stdout.write(1);
		; to globalThis.console-low-level-type
	endif
;

automatically-determine-console-low-level-type(0) await;

10 value consolebase

: type { x -- }
  typeof x { typeof-x }
	typeof-x "number" = if
		' consolebase x.toString(1)
	else
	  ' x
		typeof util "undefined" <> if
			util.format(1)
		endif
		typeof-x "function" = if
			SForthSystem.demangle(1)
		endif
	endif
	console-low-level-type
;

: . { x -- }
	typeof x { typeof-x }

	typeof-x "function" =
	typeof-x "undefined" =
	|| if
		' x type
	else
		x type
	endif
	typeof-x "number" = if " " . endif
;

: .c { x -- }
	typeof x "number" = if
		x.toString(0) { y } "." "," y.replaceAll type " " .
	endif
;

: hex. ( x1 ) hex2str . ;

: .s ( skipCheck )
	"<" depth 1- »> « + + . depth dup 0 swap 1
	do i
		dup i - pick { e }
		typeof e { typeof-e }
		typeof-e "string" = if
			"»" e "«" + +
		elseif typeof-e "function" = typeof-e "undefined" = || if
			' e
		else
			e
		endif
		type " " .
	loop
	drop ;

: emit ( x -- ) String.fromCharCode . ;

: clearcurrentline {} »\r\u001B[K« . ;

: binary ( -- ) 2 to consolebase ;
: decimal ( -- ) 10 to consolebase ;
: hex ( -- ) 16 to consolebase ;

:macro see { function_object -- } :[ "#function_object".startsWith("$dot") ? $#function_object.toString() : #function_object.toString() ]: "\n" + . ;
