include forth.fs
include console.fs

: stars ( mask -- )
  begin
    dup 1 & if '* else 32 then emit
    1 >>> dup
  not if break endif space again drop ;

: triangle ( order -- )
  1 swap lshift ( 2^order )
  1 over 0 swap 1 do i
    cr over i - spaces dup stars
    dup 2* xor
  loop 2drop ;

\ The precision of node doesn't allow higher values than 5 :(
5 triangle
