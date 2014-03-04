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

\ base functions
:macro true {} :[ true ]: ;
:macro false {} :[ false ]: ;
:macro undefined {} :[ undefined ]: ;
:macro null {} :[ null ]: ;

:macro new { name } :[ name .forth_function ]: if :[ new name (stack) ]: else :[ new name () ]: endif ;

:macro value { name } :[ var name = stack.pop() ]; ;
:macro alias { name } value name ;
:macro constant { name } value name ;

:macro to { name } :[ name = stack.pop() ]; ;
:macro !> { name } to name ;

:macro +to { name } :[ name += stack.pop() ]; ;
:macro +!> { name } +to name ;

:macro continue {} :[ continue ]; ;
:macro break {} :[ break ]; ;
:macro leave {} :[ break ]; ;
:macro exit {} :[ return ]; ;

\ TODO: fix the case handling
:macro of { key } :[ case key : ]:d ;
:macro endof {} :[ break ]; ;
:macro default {} :[ default: ]:d ;

:macro ' { name } :[ name ]: ;

:macro typeof { name } :[ typeof name ]: ;

\ dummy function
:macro ok {} ;

: output-stack-info { id -- only debugging } :[ console.log(id + ": stack size=" + stack.size() + " content=" + JSON.stringify(stack.stac)) ]; ;
: clearstack ( -- ) stack.clear drop ;

\ data stack operations
: dup { x -- x x } x x ;

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

: depth {} ( -- n ) stack.size ;

: pick {} ( x ) ( xu ... x1 x0 u -- xu ... x1 x0 xu ) stack.get ;

: roll {} ( x ) ( xu xu-1 ... x0 u -- xu-1 ... x0 xu ) stack.remove ;

\ TODO: extend the compiler to detect if .add() or so has to be called


: & { x1 x2 -- x3 } :[ x1 & x2 ]: ;

: && { x1 x2 -- x3 } :[ x1 &&x2 ]: ;

: | { x1 x2 -- x3 } :[ x1 | x2 ]: ;

: || { x1 x2 -- x3 } :[ x1 || x2 ]: ;

: or { x1 x2 -- x3 }
	typeof x1 "boolean = typeof x2 "boolean = || if
		x1 x2 ||
	else
		x1 x2 |
	endif
;
: and { x1 x2 -- x3 }
	typeof x1 "boolean = typeof x2 "boolean = || if
		x1 x2 &&
	else
		x1 x2 &
	endif
;

: xor { x1 x2 -- x3 } :[ x1 ^ x2 ]: ;

: not { x1 -- x2 }
	typeof x1 "boolean = if
		:[ !x1 ]:
	else
		:[ ~x1 ]:
	endif
;

: invert {} ( x1 -- x3 ) :[ stack.pop() ^ -1 ]: ;

\ math operations

: tofixed { num digits -- str } num 0= IF 1e-323 else num endif { num } digits num.toFixed ;

: deg2rad {} ( x1 -- x2 ) 180 / Math.PI * ;
: rad2deg {} ( x1 -- x2 ) Math.PI / 180 * ;

:macro abs {} ( x1 -- x2 ) Math.abs ;
:macro acos {} ( x1 -- x2 ) Math.acos ;
:macro asin {} ( x1 -- x2 ) Math.asin ;
:macro atan {} ( x1 -- x2 ) Math.atan ;
:macro atan2 {} ( y x -- x2 ) Math.atan2 ;
:macro ceil {} ( x1 -- x2 ) Math.ceil ;
:macro cos {} ( x1 -- x2 ) Math.cos ;
:macro exp {} ( x1 -- x2 ) Math.exp ;
:macro floor {} ( x1 -- x2 ) Math.floor ;
:macro log {} ( x1 -- x2 ) Math.log ;
:macro pow {} ( x1 x2 -- x3 ) Math.pow ;
:macro random {} ( -- x ) Math.random ;
:macro round {} ( x1 -- x2 ) Math.round ;
:macro sin {} ( x1 -- x2 ) Math.sin ;
:macro sqrt {} ( x1 -- x2 ) Math.sqrt ;
:macro tan {} ( x1 -- x2 ) Math.tan ;

: acosdeg {} ( x1 -- x2 ) acos rad2deg ;
: asindeg {} ( x1 -- x2 ) asin rad2deg ;
: atandeg {} ( x1 -- x2 ) atan rad2deg ;
: cosdeg {} ( x1 -- x2 ) deg2rad cos ;
: sindeg {} ( x1 -- x2 ) deg2rad sin ;
: tandeg {} ( x1 -- x2 ) deg2rad tan ;

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
: 0= {} ( x1 -- f ) :[ stack.pop() == 0 ]: ;
: 0<> {} ( x1 -- f ) :[ stack.pop() != 0 ]: ;
: 0> {} ( x1 -- f ) :[ stack.pop() > 0 ]: ;
: 0>= {} ( x1 -- f ) :[ stack.pop() >= 0 ]: ;
: 0< {} ( x1 -- f ) :[ stack.pop() < 0 ]: ;
: 0<= {} ( x1 -- f ) :[ stack.pop() <= 0 ]: ;

: 1+ {} ( x1 -- x2 ) 1 + ;
: 1- {} ( x1 -- x2 ) 1 - ;

\ return stack functions
:macro >r {} ( w -- R:w ) ' returnStack not if new ForthStack to returnStack endif returnStack.push drop ;
:macro r> {} ( R:w -- w ) returnStack.pop ;
:macro r@ {} ( -- w R: w -- w ) returnStack.top ;
:macro rdrop {} ( R:w -- ) returnStack.pop drop ;
:macro rdepth {} ( -- n ) returnStack.size ;
:macro rpick {} ( x ) ( xu ... x1 x0 u -- xu ... x1 x0 xu ) returnStack.get ;

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
:macro throw { obj -- } :[ throw obj ]; ;

: jseval {} ( str -- ) eval drop ;

:macro compile {} ( x1 -- ) forth.compile ;

: execute { x1 -- } :[ forthFunctionCall(stack,x1) ]; ;

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

: ! { value index variable -- } :[ variable[index] = value ]; ;
: @ { index variable -- value } :[ variable[index] ]: ;

: store-in-array { arr -- } arr.length 1- -1 1 do i i arr ! loop ;

\ String functions

: count { str -- str len } :[ str.toString() ]: { s } str s.length ;

: o>string { n -- str } :[ n.toString() ]: ;
: /string { str n -- str } n undefined str.substr ;
