
include console.fs "
include forth.fs "
include time.fs "
include filesystem.fs "

include pdfkit.fs "

: bye ( -- ) 0 process.exit drop ;

time-in-ms
" wieso nur " .
time-in-ms swap - . " ms " .

" true if 12 . endif " compile jseval

\ " false if 1 . else 2 . endif " compile jseval

1 2 min .
1 2 max .

false true false

if
    if
        if
            1 .
        else
            2 .
        endif
    else
        if
            3 .
        else
            4 .
        endif
    endif
else
    if
        if
            5 .
        else
            6 .
        endif
    else
        if
            7 .
        else
            8 .
        endif
    endif
then

" \033[31mHello\033[0m World " .

new ForthStack value stack2

2 stack2.push drop
.s
stack2.pop
.s

.s

0.2 floor .

13 3 /mod . .

" clear " . clearStack

.s

2 Math.PI * rad2deg .
180 deg2rad .

Math.PI sin .
180 sindeg .

45 sindeg dup . asindeg . cr

"
: testfunc1 ( -- ) \" Func 1 \" . ;
: testfunc2 ( -- ) \" Func 2 \" . ;

undefined value testvar
true if
    ' testfunc1 to testvar
else

    ' testfunc2 to testvar
endif

typeof testvar .
typeof Math.PI .

testvar ' testvar execute

" compile jseval

testfunc1
testfunc2


Math.PI ' sin execute .


: nestedtest " no " to this.bla 42 to this.answer ;
new nestedtest { nt }
nt.answer 42 = not if " :( " . endif
nt.bla " no " = not if " :( " . endif

:noname " :) " . ; execute

: begin-until-test   ( -- )  7 BEGIN  1+ dup 12 = UNTIL . ;
begin-until-test

\ : begin-while-repeat-test  ( -- )  7 BEGIN 1+ dup 12 < WHILE dup cr . REPEAT 5 spaces . ;
\ begin-while-repeat-test

: begin-again-test   ( -- 12 )  7 BEGIN 1+ dup 12 = IF " erreicht " . EXIT THEN AGAIN " wird nie erreicht " . ;

begin-again-test
