
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

0.2 floor .

13 3 /mod . .
