
\ Bitwise operations test

\ Binary: 1010 (10) and 1100 (12) -> 1000 (8)
10 12 & 8 = »10 12 & failed« assert

\ Binary: 1010 (10) or 1100 (12) -> 1110 (14)
10 12 | 14 = »10 12 | failed« assert

\ Binary: 1010 (10) xor 1100 (12) -> 0110 (6)
10 12 xor 6 = »10 12 xor failed« assert

\ Shift
1 3 lshift 8 = »1 3 lshift failed« assert
8 2 rshift 2 = »8 2 rshift failed« assert

\ Invert (bitwise not)
0 invert -1 = »0 invert failed« assert
