
" forth.fs " include
" console.fs " include
" time.fs " include
" filesystem.fs " include

\ time-in-ms
\ " wieso nur " .
\ time-in-ms swap - .

" true if 12 . endif " compile jseval

\ " false if 1 . else 2 . endif " compile jseval

\ 1 2 min .
\ 1 2 max .

false false false

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

:[ new ForthStack() ]: value stack2

2 { x } :[ stack2.push(x) ]:d
.s
:[ stack2.pop() ]:
.s

.s

0.2 floor .

13 3 /mod . .

" clear " . clearStack

.s

2 PI * rad2deg .
180 deg2rad .

PI sin .
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
testvar execute
" compile jseval

PI ' sin execute .
