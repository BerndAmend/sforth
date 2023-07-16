(
The MIT License (MIT)

Copyright (c) 2013-2022 Bernd Amend <bernd.amend+sforth@gmail.com>

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

\ Literals
:macro true {} :[ true ]: ;
:macro false {} :[ false ]: ;
:macro undefined {} :[ undefined ]: ;
:macro null {} :[ null ]: ;

:macro continue {} :[ continue ]; ;
:macro break {} :[ break ]; ;
:macro leave {} :[ break ]; ;
:macro exit {} :[ return ]; ;
:macro return {} :[ return ]; ;

:macro new { name }
// spaces are used to circumvent "Mixed spaces and tabs." warnings from jshint
:[
    var sforth_new_helper_variable_42 = null; // jshint ignore:line
    if( name .forth_function) {
        sforth_new_helper_variable_42 = new name (stack);
    } else {
        var args_for_new = stack.getTopElements( name .length); // jshint ignore:line
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
]:d
' sforth_new_helper_variable_42
;

:macro let { name } :[ let name = stack.pop() ]; ;
:macro value { name } :[ var name = stack.pop() ]; ;
:macro const { name } :[ const name = stack.pop() ];  ;
:macro constant { name } :[ const name = stack.pop() ];  ;

:macro to { name } :[ name = stack.pop() ]; ;
:macro !> { name } to name ;

:macro +to { name } :[ name += stack.pop() ]; ;
:macro +!> { name } +to name ;

:macro alias { name } value name ;

\ TODO: fix the case handling
:macro of { key } :[ case key : ]:d ;
:macro endof {} :[ break ]; ;
:macro default {} :[ default: ]:d ;

:macro ' { name } :[ name ]: ;

:macro typeof { name } :[ typeof name ]: ;
:macro instanceof { name } :[ stack.pop() instanceof name ]: ;

\ dummy function
:macro ok {} ;

:macro clearstack {} stack.clear(0); ;

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
:macro depth {} ( -- n ) stack.size(0) ;
:macro pick {} ( x ) ( xu ... x1 x0 u -- xu ... x1 x0 xu ) stack.get(1) ;
:macro roll {} ( x ) ( xu xu-1 ... x0 u -- xu-1 ... x0 xu ) stack.remove(1) ;

:macro & {} local{ x1 x2 -- x3 } :[ x1 & x2 ]: ;
:macro && {} local{ x1 x2 -- x3 } :[ x1 && x2 ]: ;
:macro | {} local{ x1 x2 -- x3 } :[ x1 | x2 ]: ;
:macro || {} local{ x1 x2 -- x3 } :[ x1 || x2 ]: ;
:macro xor {} local{ x1 x2 -- x3 } :[ x1 ^ x2 ]: ;

: not { x1 -- x2 } :[ ! x1 ]: ;
: invert { x1 -- x2 } :[ ~ x1 ]: ;

\ math operations

:macro + {} local{ x1 x2 -- x3 } :[ x1 + x2 ]: ;
:macro - {} local{ x1 x2 -- x3 } :[ x1 - x2 ]: ;
:macro * {} local{ x1 x2 -- x3 } :[ x1 * x2 ]: ;
:macro / {} local{ x1 x2 -- x3 } :[ x1 / x2 ]: ;
:macro mod {} local{ x1 x2 -- x3 } :[ x1 % x2 ]: ;
: /mod { x1 x2 -- x3 x4 } :[ x1 % x2 ]: :[ x1 / x2 ]: Math.floor(1) ;
:macro ** {} local{ x1 x2 -- x3 } :[ x1 ** x2 ]: ;

: negate ( n -- -n ) -1 * ;

:macro m+ { x1 x2 -- x3 } :[ x1 + x2 ]: ;
:macro m- { x1 x2 -- x3 } :[ x1 - x2 ]: ;
:macro m* { x1 x2 -- x3 } :[ x1 * x2 ]: ;
:macro m/ { x1 x2 -- x3 } :[ x1 / x2 ]: ;
:macro mmod { x1 x2 -- x3 } :[ x1 % x2 ]: ;
:macro m** { x1 x2 -- x3 } :[ x1 ** x2 ]: ;

:macro << {} local{ x1 x2 -- x3 } :[ x1 << x2 ]: ;
:macro >> {} local{ x1 x2 -- x3 } :[ x1 >> x2 ]: ;
:macro >>> {} local{ x1 x2 -- x3 } :[ x1 >>> x2 ]: ;
:macro lshift {} << ;
:macro rshift {} >>> ;

:macro = {} local{ x1 x2 -- f } :[ x1 == x2 ]: ;
:macro === {} local{ x1 x2 -- f } :[ x1 === x2 ]: ;
:macro !== {} local{ x1 x2 -- f } :[ x1 !== x2 ]: ;
:macro <> {} local{ x1 x2 -- f } :[ x1 != x2 ]: ;
:macro > {} local{ x1 x2 -- f } :[ x1 > x2 ]: ;
:macro >= {} local{ x1 x2 -- f } :[ x1 >= x2 ]: ;
:macro < {} local{ x1 x2 -- f } :[ x1 < x2 ]: ;
:macro <= {} local{ x1 x2 -- f } :[ x1 <= x2 ]: ;

:macro m= { x1 x2 -- f } :[ x1 == x2 ]: ;
:macro m=== { x1 x2 -- f } :[ x1 === x2 ]: ;
:macro m!== { x1 x2 -- f } :[ x1 !== x2 ]: ;
:macro m<> { x1 x2 -- f } :[ x1 != x2 ]: ;
:macro m> { x1 x2 -- f } :[ x1 > x2 ]: ;
:macro m>= { x1 x2 -- f } :[ x1 >= x2 ]: ;
:macro m< { x1 x2 -- f } :[ x1 < x2 ]: ;
:macro m<= { x1 x2 -- f } :[ x1 >= x2 ]: ;

\ we provide a faster implementation for important functions
:macro 0= {} local{ x1 -- f } :[ x1 === 0 ]: ;
:macro 0<> {} local{ x1 -- f } :[ x1 != 0 ]: ;
:macro 0> {} local{ x1 -- f } :[ x1 > 0 ]: ;
:macro 0>= {} local{ x1 -- f } :[ x1 >= 0 ]: ;
:macro 0< {} local{ x1 -- f } :[ x1 < 0 ]: ;
:macro 0<= {} local{ x1 -- f } :[ x1 <= 0 ]: ;

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

: deg2rad ( x1 -- x2 ) 180.0 / ' Math.PI * ;
: rad2deg ( x1 -- x2 ) ' Math.PI / 180.0 * ;

: acosdeg ( x1 -- x2 ) Math.acos(1) rad2deg ;
: asindeg ( x1 -- x2 ) Math.asin(1) rad2deg ;
: atandeg ( x1 -- x2 ) Math.atan(1) rad2deg ;
: cosdeg ( x1 -- x2 ) deg2rad Math.cos(1) ;
: sindeg ( x1 -- x2 ) deg2rad Math.sin(1) ;
: tandeg ( x1 -- x2 ) deg2rad Math.tan(1) ;

: assert { flag text -- } ' flag not if ' text "\n" + . endif ;

\ Exceptions
:macro throw {} ( obj -- ) :[ throw stack.pop() ]; ;

: execute ( skipCheck ) { x1 } x1 ;

:macro create-empty-object {} :[ {} ]: ;

: create-array { num -- newArray } num stack.getTopElements(1) ;

: new-empty-array ( -- array ) :[ [] ]: ;
: new-array { size -- newArray } :[ new Array(size) ]: ;

: ! { value index variable -- } :[ variable[index] = value ]; ;
: @ { index variable -- value } :[ variable[index] ]: ;

:macro m! { variable index value -- } :[ variable [ index ] = value ]; ;
:macro m@ { variable index -- value } :[ variable [ index ] ]: ;

\ String functions

: tofixed { num digits -- str } num 0= if 1e-323 else num endif to num digits num.toFixed ;

: count { str -- len } :[ str.toString().length ]: ;

: hex2str { x1 -- x2 } "$" 16 x1.toString + ;

: o>string { n -- str } n.toString(0) ;
: /string { str n -- str } n str.slice(1) ;

: time-in-ms ( -- x ) Date.now(0) ;

:macro import {} :[ import(stack.pop()) ]: ;

:js sleep { milliseconds } :[ new Promise(resolve => setTimeout(resolve, milliseconds)) ]: return;
