: gcd ( a b -- n )
  begin dup while tuck mod repeat drop ;

: fib ( n -- fib )
  0 1 rot 0 ?do  over + swap  loop drop ; 
