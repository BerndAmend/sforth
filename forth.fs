
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

: depth ( -- n ) :[ stack.size() ]: ;

: pick { x } ( xu ... x1 x0 u -- xu ... x1 x0 xu ) :[ stack.get(x) ]: ;

: roll { x } ( xu xu-1 ... x0 u -- xu-1 ... x0 xu ) :[ stack.remove(x) ]: ;

: or { x1 x2 -- x3 } :[ x1 | x2 ]: ;
: and { x1 x2 -- x3 } :[ x1 & x2 ]: ;
: xor { x1 x2 -- x3 } :[ x1 ^ x2 ]: ;
: not { x1 x2 -- x3 } :[ x1 ^ -1 ]: ;
: invert { x1 x2 -- x3 } :[ x1 ^ -1 ]: ;

: + { x1 x2 -- x3 } :[ x1 + x2 ]: ;
: - { x1 x2 -- x3 } :[ x1 - x2 ]: ;
: * { x1 x2 -- x3 } :[ x1 * x2 ]: ;
: / { x1 x2 -- x3 } :[ x1 / x2 ]: ;
: mod { x1 x2 -- x3 } :[ x1 % x2 ]: ;
: /mod { x1 x2 -- x3 } :[ x1 % x2 ]: :[ Math.floor(x1 / x2) ]: ;

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

: jseval { str -- } :[ global.eval(str) ]:d ;

\ math operations
: abs { x1 -- x2 } :[ Math.abs(x1) ]: ;
: acos { x1 -- x2 } :[ Math.acos(x1) ]: ;
: asin { x1 -- x2 } :[ Math.asin(x1) ]: ;
: atan { x1 -- x2 } :[ Math.atan(x1) ]: ;
: atan2 { y x -- x2 } :[ Math.atan2(y,x) ]: ;
: ceil { x1 -- x2 } :[ Math.ceil(x1) ]: ;
: cos { x1 -- x2 } :[ Math.cos(x1) ]: ;
: exp { x1 -- x2 } :[ Math.exp(x1) ]: ;
: floor { x1 -- x2 } :[ Math.floor(x1) ]: ;
: log { x1 -- x2 } :[ Math.log(x1) ]: ;
: pow { x1 x2 -- x3 } :[ Math.pow(x1, x2) ]: ;
: random { -- x } :[ Math.random() ]: ;
: round { x1 -- x2 } :[ Math.round(x1) ]: ;
: sin { x1 -- x2 } :[ Math.sin(x1) ]: ;
: sqrt { x1 -- x2 } :[ Math.sqrt(x1) ]: ;
: tan { x1 -- x2 } :[ Math.tan(x1) ]: ;
