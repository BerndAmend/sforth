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
:macro Infinity {} :[ Infinity ]: ;

:macro new { name }
	:[
		var sforth_new_helper_variable_42 = null;
		if( name .forth_function) {
			sforth_new_helper_variable_42 = new name (stack);
		} else {
			var args_for_new = stack.getTopElements( name .length);
			switch( name .length) {
				case 0: sforth_new_helper_variable_42 = new name (); break;
				case 1: sforth_new_helper_variable_42 = new name (args_for_new[0]); break;
				case 2: sforth_new_helper_variable_42 = new name (args_for_new[0], args_for_new[1]); break;
				case 3: sforth_new_helper_variable_42 = new name (args_for_new[0], args_for_new[1], args_for_new[2]); break;
				case 4: sforth_new_helper_variable_42 = new name (args_for_new[0], args_for_new[1], args_for_new[2], args_for_new[3]); break;
				case 5: sforth_new_helper_variable_42 = new name (args_for_new[0], args_for_new[1], args_for_new[2], args_for_new[3], args_for_new[4]); break;
				case 6: sforth_new_helper_variable_42 = new name (args_for_new[0], args_for_new[1], args_for_new[2], args_for_new[3], args_for_new[4], args_for_new[5]); break;
				case 7: sforth_new_helper_variable_42 = new name (args_for_new[0], args_for_new[1], args_for_new[2], args_for_new[3], args_for_new[4], args_for_new[5], args_for_new[6]); break;
				case 8: sforth_new_helper_variable_42 = new name (args_for_new[0], args_for_new[1], args_for_new[2], args_for_new[3], args_for_new[4], args_for_new[5], args_for_new[6], args_for_new[7]); break;
				default: throw new Error("new should be revised, it can not handle ctors with more than 8 arguments");
			}
		}
		stack.push(sforth_new_helper_variable_42);
	];
;

:macro value { name } :[ var name = stack.pop() ]; ;
:macro constant { name } value name ;

:macro to { name } :[ name = stack.pop() ]; ;
:macro !> { name } to name ;

:macro +to { name } :[ name += stack.pop() ]; ;
:macro +!> { name } +to name ;

:macro alias { name } to name ;

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
:macro instanceof { name } { sforth_instanceof_helper_variable_42 } :[ sforth_instanceof_helper_variable_42 instanceof name ]: ;

\ dummy function
:macro ok {} ;

: output-stack-info { id -- only debugging } :[ console.log(id + ": stack size=" + stack.size() + " content=" + JSON.stringify(stack.stac)) ]; ;
: clearstack ( -- ) stack.clear ;

\ data stack operations
: dup { x -- x x } ' x ' x ;

: drop { x } ;

: swap { x1 x2 -- x2 x1 } ' x2 ' x1 ;

: over { x1 x2 -- x1 x2 x1 } ' x1 ' x2 ' x1 ;

: rot { x1 x2 x3 -- x2 x3 x1 } ' x2 ' x3 ' x1 ;

: -rot { x1 x2 x3 -- x3 x1 x2 } ' x3 ' x1 ' x2 ;

: tuck { x1 x2 -- x2 x1 x2 } ' x2 ' x1 ' x2 ;

: nip { x1 x2 -- x2 } ' x2 ;


: 2dup { x1 x2 -- x1 x2 x1 x2 } ' x1 ' x2 ' x1 ' x2 ;

: 2drop { x1 x2 -- } ;

: 2swap { x1 x2 x3 x4 -- x3 x4 x1 x2 } ' x3 ' x4 ' x1 ' x2 ;

: 2over { x1 x2 x3 x4 -- x1 x2 x3 x4 x1 x2 } ' x1 ' x2 ' x3 ' x4 ' x1 ' x2 ;

: depth {} ( -- n ) stack.size ;

: pick {} ( x ) ( xu ... x1 x0 u -- xu ... x1 x0 xu ) stack.get ;

: roll {} ( x ) ( xu xu-1 ... x0 u -- xu-1 ... x0 xu ) stack.remove ;


:macro & {} ( x1 x2 -- x3 ) :[ stack.pop() & stack.pop() ]: ;

:macro && {} ( x1 x2 -- x3 ) :[ stack.pop() && stack.pop() ]: ;

:macro | {} ( x1 x2 -- x3 ) :[ stack.pop() | stack.pop() ]: ;

:macro || {} ( x1 x2 -- x3 ) :[ stack.pop() || stack.pop() ]: ;

:macro xor {} ( x1 x2 -- x3 ) :[ stack.pop() ^ stack.pop() ]: ;

:macro not {} ( x1 -- x2 ) :[ !stack.pop() ]: ;

:macro invert {} ( x1 -- x2 ) :[ ~stack.pop() ]: ;

:macro negate {} ( n -- -n ) -1 * ;

\ math operations

: tofixed { num digits -- str } num 0= if 1e-323 else num endif { num } digits num.toFixed ;

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

:macro m+ { x1 x2 -- x3 } :[ x1 + x2 ]: ;
:macro m- { x1 x2 -- x3 } :[ x1 - x2 ]: ;
:macro m* { x1 x2 -- x3 } :[ x1 * x2 ]: ;
:macro m/ { x1 x2 -- x3 } :[ x1 / x2 ]: ;
:macro mmod { x1 x2 -- x3 } :[ x1 % x2 ]: ;

: << { x1 x2 -- x3 } :[ x1 << x2 ]: ;
: >> { x1 x2 -- x3 } :[ x1 >> x2 ]: ;
: >>> { x1 x2 -- x3 } :[ x1 >>> x2 ]: ;
: lshift << ;
: rshift >>> ;

:macro = {} ( x1 x2 -- f ) :[ stack.pop() == stack.pop() ]: ;
:macro === {} ( x1 x2 -- f ) :[ stack.pop() === stack.pop() ]: ;
:macro <> {} ( x1 x2 -- f ) :[ stack.pop() != stack.pop() ]: ;
:macro > {} ( x1 x2 -- f ) :[ stack.pop() < stack.pop() ]: ;
:macro >= {} ( x1 x2 -- f ) :[ stack.pop() <= stack.pop() ]: ;
:macro < {} ( x1 x2 -- f ) :[ stack.pop() > stack.pop() ]: ;
:macro <= {} ( x1 x2 -- f ) :[ stack.pop() >= stack.pop() ]: ;

:macro m= { x1 x2 -- f } :[ x1 == x2 ]: ;
:macro m=== { x1 x2 -- f } :[ x1 === x2 ]: ;
:macro m<> { x1 x2 -- f } :[ x1 != x2 ]: ;
:macro m> { x1 x2 -- f } :[ x1 > x2 ]: ;
:macro m>= { x1 x2 -- f } :[ x1 >= x2 ]: ;
:macro m< { x1 x2 -- f } :[ x1 < x2 ]: ;
:macro m<= { x1 x2 -- f } :[ x1 >= x2 ]: ;

\ we provide a faster implementation for important functions
:macro 0= {} ( x1 -- f ) :[ stack.pop() == 0 ]: ;
:macro 0<> {} ( x1 -- f ) :[ stack.pop() != 0 ]: ;
:macro 0> {} ( x1 -- f ) :[ stack.pop() > 0 ]: ;
:macro 0>= {} ( x1 -- f ) :[ stack.pop() >= 0 ]: ;
:macro 0< {} ( x1 -- f ) :[ stack.pop() < 0 ]: ;
:macro 0<= {} ( x1 -- f ) :[ stack.pop() <= 0 ]: ;

:macro m0= { x1 -- f } :[ x1 == 0 ]: ;
:macro m0=== { x1 -- f } :[ x1 === 0 ]: ;
:macro m0<> { x1 -- f } :[ x1 != 0 ]: ;
:macro m0> { x1 -- f } :[ x1 > 0 ]: ;
:macro m0>= { x1 -- f } :[ x1 >= 0 ]: ;
:macro m0< { x1 -- f } :[ x1 < 0 ]: ;
:macro m0<= { x1 -- f } :[ x1 <= 0 ]: ;

:macro 1+ {} ( x1 -- x2 ) 1 + ;
:macro 1- {} ( x1 -- x2 ) 1 - ;
:macro 2* {} ( x1 -- x2 ) 2 * ;
:macro 2/ {} ( x1 -- x2 ) 2 / ;

\ return stack functions
: >r {} ( w -- R:w ) ' this.returnStack not if new ForthStack to this.returnStack endif this.returnStack.push ;
: r> {} ( R:w -- w ) this.returnStack.pop ;
: r@ {} ( -- w R: w -- w ) this.returnStack.top ;
: rdrop {} ( R:w -- ) this.returnStack.pop drop ;
: rdepth {} ( -- n ) this.returnStack.size ;
: rpick {} ( x ) ( xu ... x1 x0 u -- xu ... x1 x0 xu ) this.returnStack.get ;

\ : within { x1 x2 x3 -- f } ![ if (x1 < x2 && x2 <= x3) return 0; else return -1; ]! ;

: min ( n1 n2 -- n3 ) Math.min ;
: max ( n1 n2 -- n3 ) Math.max ;

: assert { flag text -- } flag not if text . endif ;

\ Exceptions
:macro throw {} ( obj -- ) :[ throw stack.pop() ]; ;

: jseval ( str -- ) eval ;

: compile ( x1 -- ) forth.compile ;

: execute { x1 -- } x1 ;

: create-array { num -- new Array } :[ stack.getTopElements(num) ]: ;

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

:macro m! { variable index value -- } :[ variable [ index ] = value ]; ;
:macro m@ { variable index -- value } :[ variable [ index ] ]: ;

: store-in-array { arr -- } arr.length 1- -1 1 do i i arr ! loop ;

\ String functions

: count { str -- len } :[ str.toString().length ]: ;

: o>string { n -- str } :[ n.toString() ]: ;
: /string { str n -- str } n undefined str.substr ;
