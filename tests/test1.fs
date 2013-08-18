\
\ a line comment
\ another line comment
\ another line comment with a number 32

: 2over { x1 x2 x3 x4 -- x1 x2 x3 x4 x1 x2 } x1 x2 x3 x4 x1 x2 ;

: 2swap { x1 x2 x3 x4 -- x3 x4 x1 x2 } x3 x4 x1 x2 ;

1 2 3 4 5
:[ console.log(stack.toString()) ]:d

2swap
:[ console.log(stack.toString()) ]:d

( )
( a bracket comment )
( a bracket comment
	that spans multiple lines
)
( a comment that contains
	( another nested comment )
	and additional text after
)

\ push numbers on the stack
12 23 42
{ x1 x2 x3 -- bla }

42 ( another comment ) 19 ( )

" A test string "

" Another test string with a escaped character like \" or \"\t\". "

{ str1 str2 }

\ embed javascript sourcecode
:[ console.log("wieso nur") ]:d

\ create a constant
100 constant TEST_CONSTANT
" bla " constant STRING_CONSTANT

\ create a value
800 value testvalue
10 to testvalue


clearStack

12 24 +

.s

36 =

.s

1 2
.s
swap

clearStack

" text  " 42 + .

" \"Bla\" " .

: ?dup ( x -- 0 | x x ) :[ stack.isEmpty() ]: if dup endif ;
