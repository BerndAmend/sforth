
\ Stack operations test

clearstack

\ dup
1 dup
1 = »dup check 1 failed« assert
1 = »dup check 2 failed« assert
clearstack

\ drop
1 drop depth 0 = »drop failed« assert
clearstack

\ swap
1 2 swap
1 = »swap check 1 failed« assert
2 = »swap check 2 failed« assert
clearstack

\ over
1 2 over
1 = »over check 1 failed« assert
2 = »over check 2 failed« assert
1 = »over check 3 failed« assert
clearstack

\ rot
1 2 3 rot
1 = »rot check 1 failed« assert
3 = »rot check 2 failed« assert
2 = »rot check 3 failed« assert
clearstack

\ -rot
1 2 3 -rot
2 = »-rot check 1 failed« assert
1 = »-rot check 2 failed« assert
3 = »-rot check 3 failed« assert
clearstack

\ tuck
1 2 tuck
2 = »tuck check 1 failed« assert
1 = »tuck check 2 failed« assert
2 = »tuck check 3 failed« assert
clearstack

\ nip
1 2 nip
2 = »nip check 1 failed« assert
depth 0 = »nip check 2 failed« assert
clearstack

\ 2dup
1 2 2dup
2 = »2dup check 1 failed« assert
1 = »2dup check 2 failed« assert
2 = »2dup check 3 failed« assert
1 = »2dup check 4 failed« assert
clearstack

\ 2drop
1 2 2drop depth 0 = »2drop failed« assert
clearstack

\ 2swap
1 2 3 4 2swap
2 = »2swap check 1 failed« assert
1 = »2swap check 2 failed« assert
4 = »2swap check 3 failed« assert
3 = »2swap check 4 failed« assert
clearstack

\ 2over
1 2 3 4 2over
2 = »2over check 1 failed« assert
1 = »2over check 2 failed« assert
4 = »2over check 3 failed« assert
3 = »2over check 4 failed« assert
2 = »2over check 5 failed« assert
1 = »2over check 6 failed« assert
clearstack

\ pick
10 20 30 2 pick 10 = »pick failed« assert
clearstack

\ roll
10 20 30 40 2 roll 20 = depth 4 = && »roll failed« assert
clearstack
