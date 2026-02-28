
\ Math operations test

1 2 + 3 = »1 2 + failed« assert
3 1 - 2 = »3 1 - failed« assert
2 3 * 6 = »2 3 * failed« assert
6 2 / 3 = »6 2 / failed« assert
7 3 mod 1 = »7 3 mod failed« assert
7 3 /mod 2 = swap 1 = && »7 3 /mod failed« assert
2 3 ** 8 = »2 3 ** failed« assert

\ Increment/Decrement
10 1+ 11 = »10 1+ failed« assert
10 1- 9 = »10 1- failed« assert

\ Multiplication/Division by 2
10 2* 20 = »10 2* failed« assert
10 2/ 5 = »10 2/ failed« assert

\ Negate/Abs
10 negate -10 = »10 negate failed« assert
-10 abs 10 = »-10 abs failed« assert

\ Min/Max
10 20 Math.min(2) 10 = »10 20 Math.min(2) failed« assert
10 20 Math.max(2) 20 = »10 20 Math.max(2) failed« assert

\ Floating point (basic check)
1.5 2.5 + 4.0 = »1.5 2.5 + failed« assert
