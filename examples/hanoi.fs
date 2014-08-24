: move-disk ( v t f n -- v t f )
  dup 0= if drop exit then
  1-       >r
  rot swap r@ ( t v f n-1 ) move-disk
  rot swap
  2dup "\n »Move disk from « + swap + » to « + swap + .
  swap rot r> ( f t v n-1 ) move-disk
  swap rot ;

: hanoi ( n -- )
  1 Math.max >r
  "right" "middle" "left" r> move-disk
  drop drop drop ;

3 hanoi