
clearstack

:noname ( -- n ) 42 ; execute 42 = »either noname or execute didn't work as expected« assert

: nestedtest {}
	»no« to this.bla
	42 to this.answer
	:noname {} »:)« . ; to this.func
;

new nestedtest { nt }
nt.answer 42 = »test if the nestedtest value answer works« assert
nt.bla "no" = »test if the nestedtest function bla works« assert

// ensure that strings are correctly handled by functions
: parsingtestforthfunc ( -- str ) ";" ;
:js parsingtestjsfunc {} ";" ;
:jsnoname {} ";" ;
:noname ( -- str ) ";" ;
:noname ( -- str ) »;« ;

:macro test-to { name } to name ;
0 let bla
2 test-to bla
