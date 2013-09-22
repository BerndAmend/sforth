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

0 constant nil

\ dummy function
: ok ;

: clearstack ( -- ) stack.clear drop ;

\ data stack operations
: dup { x -- x x } x x ;

\ the following code accesses the javascript variable stack.d and calls the function is Empty
: ?dup ( x -- 0 | x x ) :[ !stack.isEmpty() ]: if dup endif ;

: drop { x } ;

: swap { x1 x2 -- x2 x1 } x2 x1 ;

: over { x1 x2 -- x1 x2 x1 } x1 x2 x1 ;

: rot { x1 x2 x3 -- x2 x3 x1 } x2 x3 x1 ;

: -rot { x1 x2 x3 -- x3 x1 x2 } x3 x1 x2 ;

: tuck { x1 x2 -- x2 x1 x2 } x2 x1 x2 ;

: nip { x1 x2 -- x2 } x2 ;


: 2dup { x1 x2 -- x1 x2 x1 x2 } x1 x2 x1 x2 ;

: 2drop { x1 x2 -- } ;

: 2swap { x1 x2 x3 x4 -- x3 x4 x1 x2 } x3 x4 x1 x2 ;

: 2over { x1 x2 x3 x4 -- x1 x2 x3 x4 x1 x2 } x1 x2 x3 x4 x1 x2 ;

: depth ( -- n ) stack.size ;

: pick ( x ) ( xu ... x1 x0 u -- xu ... x1 x0 xu ) stack.get ;

: roll ( x ) ( xu xu-1 ... x0 u -- xu-1 ... x0 xu ) stack.remove ;

\ TODO: extend the compiler to detect if .add() or so has to be called

: & { x1 x2 -- x3 } :[ x1 & x2 ]: ;
: && { x1 x2 -- x3 } :[ x1 && x2 ]: ;

: | { x1 x2 -- x3 } :[ x1 | x2 ]: ;
: || { x1 x2 -- x3 } :[ x1 || x2 ]: ;

: or { x1 x2 -- x3 }
	typeof x1 "boolean" = typeof x2 "boolean" = || if
		x1 x2 ||
	else
		x1 x2 |
	endif
;
: and { x1 x2 -- x3 }
	typeof x1 "boolean" = typeof x2 "boolean" = || if
		x1 x2 &&
	else
		x1 x2 &
	endif
;

: xor { x1 x2 -- x3 } :[ x1 ^ x2 ]: ;
: not { x1 -- x2 }
	typeof x1 "boolean" = if
		:[ !x1 ]:
	else
		:[ ~x1 ]:
	endif
;

: invert { x1 -- x3 } :[ x1 ^ -1 ]: ;

\ math operations

: deg2rad ( x1 -- x2 ) 180 / Math.PI * ;
: rad2deg ( x1 -- x2 ) Math.PI / 180 * ;

: abs ( x1 -- x2 )  Math.abs ;
: acos ( x1 -- x2 ) Math.acos ;
: asin ( x1 -- x2 ) Math.asin ;
: atan ( x1 -- x2 ) Math.atan ;
: atan2 ( y x -- x2 ) Math.atan2 ;
: ceil ( x1 -- x2 ) Math.ceil ;
: cos ( x1 -- x2 ) Math.cos ;
: exp ( x1 -- x2 ) Math.exp ;
: floor ( x1 -- x2 ) Math.floor ;
: log ( x1 -- x2 ) Math.log ;
: pow ( x1 x2 -- x3 ) Math.pow ;
: random ( -- x ) Math.random ;
: round ( x1 -- x2 ) Math.round ;
: sin ( x1 -- x2 ) Math.sin ;
: sqrt ( x1 -- x2 ) Math.sqrt ;
: tan ( x1 -- x2 ) Math.tan ;

: acosdeg ( x1 -- x2 ) acos rad2deg ;
: asindeg ( x1 -- x2 ) asin rad2deg ;
: atandeg ( x1 -- x2 ) atan rad2deg ;
: cosdeg ( x1 -- x2 ) deg2rad cos ;
: sindeg ( x1 -- x2 ) deg2rad sin ;
: tandeg ( x1 -- x2 ) deg2rad tan ;

: + { x1 x2 -- x3 } :[ x1 + x2 ]: ;
: - { x1 x2 -- x3 } :[ x1 - x2 ]: ;
: * { x1 x2 -- x3 } :[ x1 * x2 ]: ;
: / { x1 x2 -- x3 } :[ x1 / x2 ]: ;
: mod { x1 x2 -- x3 } :[ x1 % x2 ]: ;
: /mod { x1 x2 -- x3 } :[ x1 % x2 ]: x1 x2 / floor ;

: = { x1 x2 -- f } :[ x1 == x2 ]: ;
: === { x1 x2 -- f } :[ x1 === x2 ]: ;
: <> { x1 x2 -- f } :[ x1 != x2 ]: ;
: > { x1 x2 -- f } :[ x1 > x2 ]: ;
: >= { x1 x2 -- f } :[ x1 >= x2 ]: ;
: < { x1 x2 -- f } :[ x1 < x2 ]: ;
: <= { x1 x2 -- f } :[ x1 <= x2 ]: ;

\ we provide a faster implementation for important functions
: 0= { x1 -- f } :[ x1 == 0 ]: ;
: 0<> { x1 -- f } :[ x1 != 0 ]: ;
: 0> { x1 -- f } :[ x1 > 0 ]: ;
: 0>= { x1 -- f } :[ x1 >= 0 ]: ;
: 0< { x1 -- f } :[ x1 < 0 ]: ;
: 0<= { x1 -- f } :[ x1 <= 0 ]: ;

: 1+ ( x1 -- x2 ) 1 + ;
: 1- ( x1 -- x2 ) 1 - ;

\ return stack functions
: >r ( w -- R:w ) :[ if(!this.returnStack) this.returnStack = new ForthStack() ]:d returnStack.push drop ;
: r> ( R:w -- w ) this.returnStack.pop ;
: r@ ( -- w R: w -- w ) this.returnStack.top ;
: rdrop ( R:w -- ) this.returnStack.pop drop ;
: rdepth ( -- n ) this.returnStack.size ;
: rpick ( x ) ( xu ... x1 x0 u -- xu ... x1 x0 xu ) this.returnStack.get ;

( : 2>r       d – R:d        core-ext       “two-to-r”
: 2r>       R:d – d        core-ext       “two-r-from”
: 2r@       R:d – R:d d        core-ext       “two-r-fetch” )
: 2rdrop ( R:d -- ) rdrop rdrop ;


(
: u< { u1 u2 -- f } ![
		var u2 = stack.d.pop();        var u1 = stack.d.pop();
		if (u1<0)    u1 += 0x100000000 ; if (u2<0)    u2 += 0x100000000 ;
		stack.d.push(-(u1<u2));
	]! ;

: u> { u1 u2 -- f } ![
		var u2 = stack.d.pop();        var u1 = stack.d.pop();
		if (u1<0)    u1 += 0x100000000 ; if (u2<0)    u2 += 0x100000000 ;
		stack.d.push(-(u1>u2));
	]! ;
)

\ : within { x1 x2 x3 -- f } ![ if (x1 < x2 && x2 <= x3) return 0; else return -1; ]! ;

: min { n1 n2 -- n3 } n1 n2 < if n1 else n2 endif ;
: max { n1 n2 -- n3 } n1 n2 > if n1 else n2 endif ;

: assert { flag text -- } flag not if text . endif ;

\ Exceptions
\ TODO: allow forth local words
: throwError { message -- } :[ throw new Error(message) ]:d ;

: jseval ( str -- ) eval drop ;

: compile ( x1 -- ) forth.compile ;

: execute { x1 -- } :[ forthFunctionCall(stack,x1) ]:d ;

: see { function_object -- } function_object.toString cr . ;

: create-array { num -- new Array }
    new Array { result }
    begin
        result.push \ returns the number of elements in the array
        num -
        0=
    until
    result.reverse ;

: new-array { size -- } :[ new Array(size) ]: ;

: new-int8-array { size -- } :[ new Int8Array(size) ]: ;
: new-int16-array { size -- } :[ new Int16Array(size) ]: ;
: new-int32-array { size -- } :[ new Int32Array(size) ]: ;

: new-uint8-array { size -- } :[ new Uint8Array(size) ]: ;
: new-uint16-array { size -- } :[ new Uint16Array(size) ]: ;
: new-uint32-array { size -- } :[ new Uint32Array(size) ]: ;

: new-float32-array { size -- } :[ new Float32Array(size) ]: ;
: new-float64-array { size -- } :[ new Float64Array(size) ]: ;

: ! { value index variable -- } :[ variable[index] = value ]:d ;
: @ { index variable -- value } :[ variable[index] ]: ;

\ String functions

: count { str -- str len } str.toString { s } str s.length ;

: o>string { n -- str } undefined n.toString ;
: /string { str n -- str } n undefined str.substr ;
