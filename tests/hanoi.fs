: left   " left " ;
: right  " right " ;
: middle " middle " ;
 
: move-disk ( v t f n -- v t f )
  dup 0= if drop exit then
  1-       >R
  rot swap R@ ( t v f n-1 ) move-disk
  rot swap
  2dup cr " Move disk from  " execute "  to  " execute
  swap rot R> ( f t v n-1 ) move-disk
  swap rot ;
: hanoi ( n -- )
  1 max >R ' right ' middle ' left R> move-disk drop drop drop ;
