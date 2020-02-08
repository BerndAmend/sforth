clearstack

\ place some numbers on the stack
1 2 3 4 5 6 7 8 9 0

depth 10 = »depth doesn't match the expected number of elements« assert

clearstack

depth 0 = »clearstack didn't clear the stack« assert

1 2 3
dup
depth 4 = »dup added more than 1 element to the stack« assert

3 = »dup result is wrong« assert
3 = »the stack element that should have been duplicated is gone« assert
2 = »the previous stack was corrupted 1« assert
1 = »the previous stack was corrupted 2« assert

clearstack

11 42 Math.min  11 = »min didn't returned the correct value 1« assert
42 11 Math.min  11 = »min didn't returned the correct value 2« assert
11 42 Math.max  42 = »max didn't returned the correct value 1« assert
42 11 Math.max  42 = »max didn't returned the correct value 2« assert

\ TODO

0.2 Math.floor 0 = »floor result should be 0« assert

13 3 /mod 4 = swap 1 = && »/mod result should be 4 1« assert

2 Math.PI * rad2deg 360 = »result should be 360« assert
180 deg2rad Math.PI = »result should be PI« assert

(
Math.PI sin .
180 sindeg .

45 sindeg dup . asindeg . cr


Math.PI ' sin execute .
)
