(
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
)

// this file expects that you have already define a console-low-level-type function
typeof console-low-level-type "function" !== if
    typeof process "undefined" !== if
        // automatically define console-low-level-type if node.js is used
        :noname { x -- }
            x process.stdout.write(1);
        ; to global.console-low-level-type
    else
        "console-low-level-type needs to be defined" console.log(1);
    endif
endif

10 value consolebase

: type { x -- }
	typeof x "number" = if
		' consolebase x.toString(1) console-low-level-type
	else
		typeof util "undefined" <> if
			x util.format(1) console-low-level-type
		else
			x console-low-level-type
		endif
	endif
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
	typeof-x "number" = if space endif
;

: .c { x -- }
	typeof x "number" = if
		x.toString(0) { y } "." "," y.replaceAll type space
	endif
;

: hex2str { x1 -- x2 } "$" 16 x1.toString + ;
: hex. hex2str . ;

: .s
	"<" depth 1- »> « + + . depth dup 0 swap 1
	do i
		dup i - pick { e }
		typeof e { typeof-e }
		typeof-e "string" = if
			"»" e "«" + +
		else
			typeof-e "function" = typeof-e "undefined" = || if
				' e
			else
				e
			endif
		endif
		type space
	loop
	drop ;

: print-returnstack
	:[ if(!this.returnStack) return ]; \ return if no return stack exists
	this.returnStack to returnStack \ get the return stack of the caller
	"<" rdepth »> « + + . rdepth 1- rdepth 0 swap 1
	do i
		dup i - rpick type space
	loop
	drop ;

: emit ( x -- ) String.fromCharCode . ;

: space ( -- ) » « . ;
: spaces { n -- } »« 0 n 0 Math.max 1 do i » « + loop type ;
: cr ( -- ) "\n" . ;

: clearcurrentline »\r\u001B[K« . ;

: binary ( -- ) 2 to consolebase ;
: decimal ( -- ) 10 to consolebase ;
: hex ( -- ) 16 to consolebase ;

:macro see { function_object -- } :[ #function_object.toString() ]: cr . ;
