
: clearStack ( -- ) stack.clear drop ;

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

: nip { x1 x2 -- x1 } x1 ;


: 2dup { x1 x2 -- x1 x2 x1 x2 } x1 x2 x1 x2 ;

: 2drop { x1 x2 -- } ;

: 2swap { x1 x2 x3 x4 -- x3 x4 x1 x2 } x3 x4 x1 x2 ;

: 2over { x1 x2 x3 x4 -- x1 x2 x3 x4 x1 x2 } x1 x2 x3 x4 x1 x2 ;

: depth ( -- n ) stack.size ;

: pick { x } ( xu ... x1 x0 u -- xu ... x1 x0 xu ) stack.get ;

: roll { x } ( xu xu-1 ... x0 u -- xu-1 ... x0 xu ) stack.remove ;

\ TODO: extend the compiler to detect if .add() or so has to be called
: or { x1 x2 -- x3 } :[ x1 | x2 ]: ;
: and { x1 x2 -- x3 } :[ x1 & x2 ]: ;
: xor { x1 x2 -- x3 } :[ x1 ^ x2 ]: ;
: not { x1 -- x3 } :[ !x1 ]: ;
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
: <> { x1 x2 -- f } :[ x1 != x2 ]: ;
: > { x1 x2 -- f } :[ x1 > x2 ]: ;
: < { x1 x2 -- f } :[ x1 < x2 ]: ;

\ we provide a faster implementation for important functions
: 0= { x1 -- f } :[ x1 == 0 ]: ;
: 0<> { x1 -- f } :[ x1 != 0 ]: ;
: 0> { x1 -- f } :[ x1 > 0 ]: ;
: 0< { x1 -- f } :[ x1 < 0 ]: ;

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

\ Exceptions
\ TODO: allow forth local words
: throwError { message -- } :[ throw new Error(message) ]:d ;

: jseval ( str -- ) global.eval drop ;

: execute { x1 -- } :[
    if(x1.forth_function == true)
        x1(stack);
    else
        x1();
]:d ;

