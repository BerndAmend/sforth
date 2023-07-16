
: case-test-1 ( n -- n )
case
   of 14 1 endof
   of 17 2 endof
   default 3
endcase ;

0 case-test-1 3 = »case default error« assert
14 case-test-1 1 = »case of error« assert
17 case-test-1 2 = »case of error« assert
100 case-test-1 3 = »case default error« assert
