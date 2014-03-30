: left   "left . ;
: right  "right . ;
: middle "middle . ;
 
: move-disk ( v t f n -- v t f )
  dup 0= if drop exit then
  1-       >r
  rot swap r@ ( t v f n-1 ) move-disk
  rot swap
  2dup cr »Move disk from « . execute » to « . execute
  swap rot r> ( f t v n-1 ) move-disk
  swap rot ;

: hanoi ( n -- )
  1 max >r
  ' right ' middle ' left r> move-disk
  drop drop drop ;

3 hanoi